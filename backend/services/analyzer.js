const errorExplanations = require('../utils/errorExplanations');

class Analyzer {
  constructor(pages, metadata = {}) {
    this.pages = pages;
    this.metadata = metadata;
    this.issues = {
      errors: [],
      warnings: [],
      opportunities: []
    };
  }

  analyze() {
    console.log(`🔍 Analyse de ${this.pages.length} pages`);
    
    this.pages.forEach(page => {
      this.analyzePage(page);
    });
    
    // Analyses globales (sur l'ensemble du site)
    this.analyzeGlobalIssues();
    
    return {
      issues: this.issues,
      score: this.calculateScore()
    };
  }

  analyzePage(page) {
    // Codes HTTP
    this.checkStatusCodes(page);
    
    // Meta tags
    this.checkMetaTags(page);
    
    // Headings
    this.checkHeadings(page);
    
    // Content
    this.checkContent(page);
    
    // Images
    this.checkImages(page);
    
    // Links
    this.checkLinks(page);
    
    // Technical
    this.checkTechnical(page);
    
    // Security
    this.checkSecurity(page);
    
    // Schema
    this.checkSchema(page);
  }

  checkStatusCodes(page) {
    if (page.statusCode === 404) {
      this.addError(page.url, 'Erreur 404', 'Page introuvable', 'CRITICAL');
    } else if (page.statusCode >= 500) {
      this.addError(page.url, 'Erreur serveur', `Code ${page.statusCode}`, 'CRITICAL');
    } else if (page.statusCode === 301 || page.statusCode === 302) {
      this.addWarning(page.url, 'Redirection', `Code ${page.statusCode}`, 'MEDIUM');
    } else if (page.statusCode !== 200) {
      this.addWarning(page.url, 'Code HTTP inhabituel', `Code ${page.statusCode}`, 'LOW');
    }
  }

  checkMetaTags(page) {
    // Title
    if (!page.title || page.title.length === 0) {
      this.addError(page.url, 'Title manquant', 'La balise <title> est absente', 'CRITICAL', 'missing_title');
    } else if (page.title.length < 30) {
      this.addWarning(page.url, 'Title trop court', `${page.title.length} caractères (min recommandé: 30)`, 'HIGH', 'title_too_short');
    } else if (page.title.length > 60) {
      this.addWarning(page.url, 'Title trop long', `${page.title.length} caractères (max recommandé: 60)`, 'HIGH', 'title_too_long');
    }
    
    // Meta description
    if (!page.metaDescription || page.metaDescription.length === 0) {
      this.addWarning(page.url, 'Meta description manquante', 'Aucune meta description définie', 'HIGH', 'missing_meta_description');
    } else if (page.metaDescription.length < 120) {
      this.addWarning(page.url, 'Meta description trop courte', `${page.metaDescription.length} caractères (min recommandé: 120)`, 'MEDIUM', 'meta_description_too_short');
    } else if (page.metaDescription.length > 160) {
      this.addWarning(page.url, 'Meta description trop longue', `${page.metaDescription.length} caractères (max recommandé: 160)`, 'MEDIUM', 'meta_description_too_long');
    }
    
    // Meta keywords (obsolète)
    if (page.metaKeywords) {
      this.addOpportunity(page.url, 'Meta keywords présent', 'Cette balise est obsolète et peut être retirée', 'LOW');
    }
    
    // Canonical
    if (!page.canonical) {
      this.addOpportunity(page.url, 'Canonical manquant', 'Considérez ajouter une balise canonical', 'MEDIUM', 'missing_canonical');
    }
    
    // Open Graph
    if (!page.ogTitle || !page.ogDescription || !page.ogImage) {
      this.addOpportunity(page.url, 'Open Graph incomplet', 'Optimisez pour le partage sur les réseaux sociaux', 'LOW', 'missing_og');
    }
  }

  checkHeadings(page) {
    // H1
    if (page.h1.length === 0) {
      this.addError(page.url, 'H1 manquant', 'Aucune balise H1 détectée', 'CRITICAL', 'missing_h1');
    } else if (page.h1.length > 1) {
      this.addWarning(page.url, 'Plusieurs H1', `${page.h1.length} balises H1 (recommandé: 1 seule)`, 'HIGH', 'multiple_h1');
    } else if (page.h1[0].length > 70) {
      this.addWarning(page.url, 'H1 trop long', `${page.h1[0].length} caractères (max recommandé: 70)`, 'MEDIUM', 'h1_too_long');
    }
    
    // Sous-titres
    if (page.h2Count === 0 && page.wordCount > 300) {
      this.addOpportunity(page.url, 'Aucun H2', 'Structurez votre contenu avec des sous-titres', 'MEDIUM', 'missing_h2');
    }
  }

  checkContent(page) {
    // Contenu trop court
    if (page.wordCount < 300 && page.statusCode === 200) {
      this.addWarning(page.url, 'Contenu court', `${page.wordCount} mots (min recommandé: 300)`, 'HIGH', 'thin_content');
    }
    
    // Pas de contenu
    if (page.wordCount < 50) {
      this.addError(page.url, 'Contenu très faible', 'Page quasi-vide', 'CRITICAL', 'very_thin_content');
    }
    
    // Ratio contenu/HTML
    const htmlRatio = page.contentLength / (page.contentLength + 10000); // Approximation
    if (htmlRatio < 0.1) {
      this.addWarning(page.url, 'Ratio texte/HTML faible', 'Beaucoup de code pour peu de contenu', 'LOW');
    }
  }

  checkImages(page) {
    page.images.forEach((img, index) => {
      // Alt manquant
      if (!img.alt || img.alt.length === 0) {
        this.addWarning(page.url, `Image ${index + 1} sans alt`, 'Attribut alt manquant pour l\'accessibilité', 'HIGH', 'missing_alt');
      } else if (img.alt.length > 125) {
        this.addWarning(page.url, `Image ${index + 1} alt trop long`, `${img.alt.length} caractères`, 'LOW', 'alt_too_long');
      }
      
      // Dimensions manquantes
      if (!img.width || !img.height) {
        this.addOpportunity(page.url, `Image ${index + 1} sans dimensions`, 'Ajoutez width/height pour éviter le CLS', 'MEDIUM');
      }
      
      // Lazy loading
      if (index > 2 && img.loading !== 'lazy') {
        this.addOpportunity(page.url, `Image ${index + 1} pas en lazy load`, 'Améliorer les performances', 'LOW', 'image_no_lazy_load');
      }
    });
  }

  checkLinks(page) {
    // Liens cassés (404) seront détectés lors du crawl des pages liées
    
    // Trop de liens
    const totalLinks = page.internalLinks.length + page.externalLinks.length;
    if (totalLinks > 100) {
      this.addWarning(page.url, 'Trop de liens', `${totalLinks} liens (recommandé: <100)`, 'LOW');
    }
  }

  checkTechnical(page) {
    // Viewport
    if (!page.viewport) {
      this.addError(page.url, 'Viewport manquant', 'Balise viewport absente (problème mobile)', 'HIGH');
    }
    
    // Lang
    if (!page.lang) {
      this.addWarning(page.url, 'Attribut lang manquant', 'Langue non définie dans <html>', 'MEDIUM');
    }
    
    // Charset
    if (!page.charset || !page.charset.includes('UTF-8')) {
      this.addWarning(page.url, 'Charset non UTF-8', 'Encodage non optimal', 'LOW');
    }
  }

  checkSecurity(page) {
    // HTTPS
    if (!page.hasHttps) {
      this.addError(page.url, 'Pas de HTTPS', 'Page non sécurisée', 'CRITICAL');
    }
  }

  checkSchema(page) {
    // Schema markup
    if (page.jsonLd.length === 0 && !page.hasSchema) {
      this.addOpportunity(page.url, 'Pas de Schema markup', 'Ajoutez des données structurées', 'MEDIUM');
    }
  }

  analyzeGlobalIssues() {
    // Détecter les titles dupliqués
    const titleMap = new Map();
    this.pages.forEach(page => {
      if (page.title) {
        if (!titleMap.has(page.title)) {
          titleMap.set(page.title, []);
        }
        titleMap.get(page.title).push(page.url);
      }
    });
    
    titleMap.forEach((urls, title) => {
      if (urls.length > 1) {
        this.addWarning(urls[0], 'Title dupliqué', `Ce title apparaît sur ${urls.length} pages`, 'HIGH');
      }
    });
    
    // Détecter les meta descriptions dupliquées
    const descMap = new Map();
    this.pages.forEach(page => {
      if (page.metaDescription) {
        if (!descMap.has(page.metaDescription)) {
          descMap.set(page.metaDescription, []);
        }
        descMap.get(page.metaDescription).push(page.url);
      }
    });
    
    descMap.forEach((urls, desc) => {
      if (urls.length > 1) {
        this.addWarning(urls[0], 'Meta description dupliquée', `Cette description apparaît sur ${urls.length} pages`, 'MEDIUM');
      }
    });
    
    // Détecter les H1 dupliqués
    const h1Map = new Map();
    this.pages.forEach(page => {
      if (page.h1.length > 0) {
        const h1Text = page.h1[0];
        if (!h1Map.has(h1Text)) {
          h1Map.set(h1Text, []);
        }
        h1Map.get(h1Text).push(page.url);
      }
    });
    
    h1Map.forEach((urls, h1) => {
      if (urls.length > 1) {
        this.addWarning(urls[0], 'H1 dupliqué', `Ce H1 apparaît sur ${urls.length} pages`, 'MEDIUM');
      }
    });
    
    // === NOUVELLES ANALYSES V2.0 ===
    
    // Vérifier robots.txt
    if (!this.metadata.robotsTxt) {
      this.addOpportunity(this.pages[0].url, 'Robots.txt manquant', 'Aucun fichier robots.txt trouvé', 'MEDIUM', 'robots_txt_missing');
    }
    
    // Vérifier sitemap.xml
    if (!this.metadata.sitemap || !this.metadata.sitemap.found) {
      this.addWarning(this.pages[0].url, 'Sitemap.xml manquant', 'Aucun sitemap.xml trouvé', 'HIGH', 'sitemap_missing');
    } else if (this.metadata.sitemap.urlCount < this.pages.length) {
      this.addWarning(this.pages[0].url, 'Sitemap incomplet', `${this.metadata.sitemap.urlCount} URLs dans sitemap vs ${this.pages.length} pages crawlées`, 'MEDIUM', 'sitemap_incomplete');
    }
    
    // Détecter les pages orphelines (pages sans lien entrant)
    const linkedPages = new Set();
    this.pages.forEach(page => {
      page.internalLinks.forEach(link => {
        linkedPages.add(link);
      });
    });
    
    this.pages.forEach(page => {
      if (!linkedPages.has(page.url) && page.url !== this.pages[0].url) {
        this.addWarning(page.url, 'Page orpheline', 'Aucun lien interne ne pointe vers cette page', 'HIGH', 'orphan_page');
      }
    });
    
    // Détecter les liens cassés (404) - EXCLURE les fichiers non-HTML
    const allUrls = new Set(this.pages.map(p => p.url));
    const fileExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv',
      '.mp3', '.wav', '.ogg', '.m4a',
      '.zip', '.rar', '.tar', '.gz', '.7z',
      '.css', '.js', '.json', '.xml', '.txt'
    ];
    
    this.pages.forEach(page => {
      page.internalLinks.forEach(link => {
        // Ignorer les ancres et les fichiers non-HTML
        if (link.includes('#')) return;
        const linkLower = link.toLowerCase();
        if (fileExtensions.some(ext => linkLower.endsWith(ext))) return;
        
        if (!allUrls.has(link)) {
          this.addError(page.url, 'Lien cassé détecté', `Lien vers ${link} (page HTML probablement 404)`, 'HIGH', 'broken_link');
        }
      });
    });
    
    // Détecter les redirections en chaîne (> 2 redirections)
    this.pages.forEach(page => {
      if (page.redirectChain && page.redirectChain.length > 2) {
        this.addWarning(page.url, 'Chaîne de redirections', `${page.redirectChain.length} redirections successives`, 'HIGH', 'redirect_chain');
      }
    });
    
    // Détecter les pages avec profondeur excessive (> 3 clics depuis homepage)
    this.pages.forEach(page => {
      if (page.depth && page.depth > 3) {
        this.addOpportunity(page.url, 'Profondeur excessive', `Profondeur de ${page.depth} clics depuis la homepage`, 'MEDIUM', 'excessive_depth');
      }
    });
    
    // Vérifier hreflang (si présent sur certaines pages mais pas toutes)
    const pagesWithHreflang = this.pages.filter(p => p.hreflang && p.hreflang.length > 0);
    if (pagesWithHreflang.length > 0 && pagesWithHreflang.length < this.pages.length) {
      this.addWarning(this.pages[0].url, 'Hreflang incomplet', `${pagesWithHreflang.length}/${this.pages.length} pages ont hreflang`, 'MEDIUM', 'hreflang_incomplete');
    }
    
    // Vérifier pagination cassée (next/prev)
    this.pages.forEach(page => {
      if (page.nextPage && !allUrls.has(page.nextPage)) {
        this.addWarning(page.url, 'Pagination cassée', `rel="next" pointe vers ${page.nextPage} (introuvable)`, 'MEDIUM', 'pagination_broken');
      }
      if (page.prevPage && !allUrls.has(page.prevPage)) {
        this.addWarning(page.url, 'Pagination cassée', `rel="prev" pointe vers ${page.prevPage} (introuvable)`, 'MEDIUM', 'pagination_broken');
      }
    });
    
    // Vérifier AMP
    const pagesWithAmp = this.pages.filter(p => p.hasAmp);
    if (pagesWithAmp.length > 0) {
      this.addOpportunity(this.pages[0].url, 'AMP détecté', `${pagesWithAmp.length} pages ont une version AMP`, 'LOW', 'amp_detected');
    }
  }

  addError(url, title, description, priority, errorType = null) {
    const issue = { 
      url, 
      title, 
      description, 
      priority, 
      type: 'error'
    };
    
    // Ajouter l'explication si disponible
    if (errorType && errorExplanations[errorType]) {
      issue.explanation = errorExplanations[errorType];
      issue.errorType = errorType;
    }
    
    this.issues.errors.push(issue);
  }

  addWarning(url, title, description, priority, errorType = null) {
    const issue = {
      url,
      title,
      description,
      priority,
      type: 'warning'
    };
    
    // Ajouter l'explication si disponible
    if (errorType && errorExplanations[errorType]) {
      issue.explanation = errorExplanations[errorType];
      issue.errorType = errorType;
    }
    
    this.issues.warnings.push(issue);
  }

  addOpportunity(url, title, description, priority, errorType = null) {
    const issue = {
      url,
      title,
      description,
      priority,
      type: 'opportunity'
    };
    
    // Ajouter l'explication si disponible
    if (errorType && errorExplanations[errorType]) {
      issue.explanation = errorExplanations[errorType];
      issue.errorType = errorType;
    }
    
    this.issues.opportunities.push(issue);
  }

  calculateScore() {
    const criticalCount = this.issues.errors.filter(e => e.priority === 'CRITICAL').length;
    const highCount = this.issues.errors.filter(e => e.priority === 'HIGH').length;
    const mediumCount = this.issues.warnings.filter(w => w.priority === 'MEDIUM').length;
    
    let score = 100;
    
    // Pénalités
    score -= criticalCount * 20;
    score -= highCount * 10;
    score -= mediumCount * 5;
    score -= this.issues.warnings.length * 2;
    score -= this.issues.opportunities.length * 1;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

module.exports = Analyzer;
