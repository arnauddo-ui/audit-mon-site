const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class Crawler {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.baseHostname = new URL(baseUrl).hostname;
    this.visitedUrls = new Set();
    this.queue = [baseUrl];
    this.pages = [];
    this.maxPages = options.maxPages || parseInt(process.env.MAX_PAGES_PER_CRAWL) || 10000;
    this.timeout = options.timeout || 30000;
    this.userAgent = 'AuditMonSite/1.0 (SEO Crawler)';
    this.onProgress = options.onProgress || (() => {});
  }

  async crawl() {
    console.log(`🕷️  Démarrage du crawl de ${this.baseUrl}`);
    
    while (this.queue.length > 0 && this.visitedUrls.size < this.maxPages) {
      const url = this.queue.shift();
      
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
        await this.crawlPage(url);
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
          error: error.message
        });
      }
      
      // Petit délai pour ne pas surcharger le serveur
      await this.delay(100);
    }
    
    console.log(`✅ Crawl terminé: ${this.visitedUrls.size} pages`);
    return this.pages;
  }

  async crawlPage(url) {
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
        
        // Security
        hasHttps: url.startsWith('https'),
        
        // Misc
        hasAmp: $('link[rel="amphtml"]').length > 0 || $('html[amp], html[⚡]').length > 0,
      };
      
      this.pages.push(pageData);
      
      // Ajouter les liens internes à la queue
      pageData.internalLinks.forEach(link => {
        const absoluteUrl = this.makeAbsoluteUrl(link, url);
        if (absoluteUrl && !this.visitedUrls.has(absoluteUrl) && !this.queue.includes(absoluteUrl)) {
          this.queue.push(absoluteUrl);
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
