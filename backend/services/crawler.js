const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class Crawler {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.baseHostname = new URL(baseUrl).hostname;
    this.visitedUrls = new Set();
    this.queue = [{ url: baseUrl, depth: 0 }]; // Ajouter profondeur
    this.pages = [];
    this.maxPages = options.maxPages || parseInt(process.env.MAX_PAGES_PER_CRAWL) || 10000;
    this.timeout = options.timeout || 30000;
    this.userAgent = 'AuditMonSite/2.0 (SEO Crawler)';
    this.onProgress = options.onProgress || (() => {});
    this.sitemap = null;
    this.robotsTxt = null;
    this.brokenLinks = new Map(); // URL → array de pages qui pointent vers elle
  }

  async crawl() {
    console.log(`🕷️  Démarrage du crawl de ${this.baseUrl}`);
    
    // Crawler robots.txt et sitemap.xml
    await this.fetchRobotsTxt();
    await this.fetchSitemap();
    
    while (this.queue.length > 0 && this.visitedUrls.size < this.maxPages) {
      const { url, depth } = this.queue.shift();
      
      if (this.visitedUrls.has(url)) continue;
      
      // Filtrer les fichiers non-HTML (images, PDF, vidéos, etc.)
      const fileExtensions = [
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp',
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv',
        '.mp3', '.wav', '.ogg', '.m4a',
        '.zip', '.rar', '.tar', '.gz', '.7z',
        '.css', '.js', '.json', '.xml', '.txt'
      ];
      
      const urlLower = url.toLowerCase();
      if (fileExtensions.some(ext => urlLower.endsWith(ext))) {
        console.log(`⏭️  Ignoré (fichier non-HTML): ${url}`);
        continue;
      }
      
      try {
        await this.crawlPage(url, depth);
        this.onProgress({
          current: this.visitedUrls.size,
          total: this.maxPages,
          url: url
        });
      } catch (error) {
        console.error(`Erreur crawl ${url}:`, error.message);
        this.pages.push({
          url,
          status: 'error',
          error: error.message,
          depth
        });
      }
      
      // Petit délai pour ne pas surcharger le serveur
      await this.delay(100);
    }
    
    console.log(`✅ Crawl terminé: ${this.visitedUrls.size} pages`);
    
    return {
      pages: this.pages,
      metadata: {
        robotsTxt: this.robotsTxt,
        sitemap: this.sitemap,
        totalPages: this.pages.length,
        maxDepth: Math.max(...this.pages.map(p => p.depth || 0))
      }
    };
  }

  async crawlPage(url, depth = 0) {
    this.visitedUrls.add(url);
    
    const startTime = Date.now();
    
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        },
        maxRedirects: 5,
        validateStatus: () => true // Accepter tous les codes de statut
      });
      
      const loadTime = Date.now() - startTime;
      const $ = cheerio.load(response.data);
      
      // Extraire toutes les données
      const pageData = {
        url,
        statusCode: response.status,
        loadTime,
        finalUrl: response.request.res.responseUrl || url,
        redirectChain: this.getRedirectChain(response),
        depth, // Ajouter la profondeur
        
        // Meta tags
        title: $('title').text().trim(),
        metaDescription: $('meta[name="description"]').attr('content') || '',
        metaKeywords: $('meta[name="keywords"]').attr('content') || '',
        metaRobots: $('meta[name="robots"]').attr('content') || '',
        canonical: $('link[rel="canonical"]').attr('href') || '',
        
        // Open Graph
        ogTitle: $('meta[property="og:title"]').attr('content') || '',
        ogDescription: $('meta[property="og:description"]').attr('content') || '',
        ogImage: $('meta[property="og:image"]').attr('content') || '',
        ogType: $('meta[property="og:type"]').attr('content') || '',
        
        // Twitter Cards
        twitterCard: $('meta[name="twitter:card"]').attr('content') || '',
        twitterTitle: $('meta[name="twitter:title"]').attr('content') || '',
        twitterDescription: $('meta[name="twitter:description"]').attr('content') || '',
        
        // Headings
        h1: $('h1').map((i, el) => $(el).text().trim()).get(),
        h2Count: $('h2').length,
        h3Count: $('h3').length,
        h4Count: $('h4').length,
        
        // Content
        wordCount: this.getWordCount($),
        contentLength: $('body').text().trim().length,
        
        // Images
        images: this.extractImages($),
        
        // Links
        internalLinks: this.extractInternalLinks($, url),
        externalLinks: this.extractExternalLinks($, url),
        
        // Technical
        lang: $('html').attr('lang') || '',
        viewport: $('meta[name="viewport"]').attr('content') || '',
        charset: $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '',
        
        // Schema markup
        jsonLd: this.extractJsonLd($),
        hasSchema: $('[itemtype], [itemscope]').length > 0,
        
        // Hreflang
        hreflang: $('link[rel="alternate"][hreflang]').map((i, el) => ({
          lang: $(el).attr('hreflang'),
          href: $(el).attr('href')
        })).get(),
        
        // Pagination
        nextPage: $('link[rel="next"]').attr('href') || '',
        prevPage: $('link[rel="prev"]').attr('href') || '',
        
        // Security
        hasHttps: url.startsWith('https'),
        
        // Misc
        hasAmp: $('link[rel="amphtml"]').length > 0 || $('html[amp], html[⚡]').length > 0,
      };
      
      this.pages.push(pageData);
      
      // Ajouter les liens internes à la queue (avec profondeur + 1)
      pageData.internalLinks.forEach(link => {
        const absoluteUrl = this.makeAbsoluteUrl(link, url);
        if (absoluteUrl && !this.visitedUrls.has(absoluteUrl) && !this.queue.some(item => item.url === absoluteUrl)) {
          this.queue.push({ url: absoluteUrl, depth: depth + 1 });
        }
      });
      
    } catch (error) {
      throw error;
    }
  }

  extractImages($) {
    return $('img').map((i, el) => {
      const $img = $(el);
      return {
        src: $img.attr('src') || '',
        alt: $img.attr('alt') || '',
        title: $img.attr('title') || '',
        width: $img.attr('width') || '',
        height: $img.attr('height') || '',
        loading: $img.attr('loading') || ''
      };
    }).get();
  }

  extractInternalLinks($, currentUrl) {
    const links = [];
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (this.isInternalLink(href, currentUrl)) {
        links.push(href);
      }
    });
    return [...new Set(links)]; // Dédupliquer
  }

  extractExternalLinks($, currentUrl) {
    const links = [];
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (!this.isInternalLink(href, currentUrl) && href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        links.push(href);
      }
    });
    return [...new Set(links)];
  }

  extractJsonLd($) {
    const scripts = [];
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        scripts.push(json);
      } catch (e) {
        // JSON invalide, on ignore
      }
    });
    return scripts;
  }

  isInternalLink(href, currentUrl) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return false;
    }
    
    try {
      const absoluteUrl = this.makeAbsoluteUrl(href, currentUrl);
      const linkHostname = new URL(absoluteUrl).hostname;
      return linkHostname === this.baseHostname;
    } catch (e) {
      return false;
    }
  }

  makeAbsoluteUrl(href, baseUrl) {
    try {
      return new URL(href, baseUrl).toString();
    } catch (e) {
      return null;
    }
  }

  getRedirectChain(response) {
    const chain = [];
    if (response.request._redirectable && response.request._redirectable._redirectCount > 0) {
      // Axios ne fournit pas facilement la chaîne de redirections
      // On marque juste qu'il y a eu une redirection
      return [{ redirected: true }];
    }
    return chain;
  }

  async fetchRobotsTxt() {
    try {
      const robotsUrl = new URL('/robots.txt', this.baseUrl).toString();
      const response = await axios.get(robotsUrl, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        this.robotsTxt = response.data;
        console.log('✅ Robots.txt trouvé');
      }
    } catch (error) {
      console.log('⚠️  Pas de robots.txt');
    }
  }

  async fetchSitemap() {
    try {
      const sitemapUrl = new URL('/sitemap.xml', this.baseUrl).toString();
      const response = await axios.get(sitemapUrl, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        const cheerio = require('cheerio');
        const $ = cheerio.load(response.data, { xmlMode: true });
        const urls = [];
        
        $('url > loc').each((i, el) => {
          urls.push($(el).text());
        });
        
        this.sitemap = {
          found: true,
          urlCount: urls.length,
          urls: urls
        };
        console.log(`✅ Sitemap.xml trouvé (${urls.length} URLs)`);
      }
    } catch (error) {
      console.log('⚠️  Pas de sitemap.xml');
    }
  }

  getWordCount($) {
    const text = $('body').text();
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Crawler;
