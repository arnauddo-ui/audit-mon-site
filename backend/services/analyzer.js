class Analyzer {
  constructor(pages) {
    this.pages = pages;
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
      this.addError(page.url, 'Title manquant', 'La balise <title> est absente', 'HIGH');
    } else if (page.title.length < 30) {
      this.addWarning(page.url, 'Title trop court', `${page.title.length} caractères (min recommandé: 30)`, 'MEDIUM');
    } else if (page.title.length > 60) {
      this.addWarning(page.url, 'Title trop long', `${page.title.length} caractères (max recommandé: 60)`, 'MEDIUM');
    }
    
    // Meta description
    if (!page.metaDescription || page.metaDescription.length === 0) {
      this.addWarning(page.url, 'Meta description manquante', 'Aucune meta description définie', 'HIGH');
    } else if (page.metaDescription.length < 120) {
      this.addWarning(page.url, 'Meta description trop courte', `${page.metaDescription.length} caractères (min recommandé: 120)`, 'LOW');
    } else if (page.metaDescription.length > 160) {
      this.addWarning(page.url, 'Meta description trop longue', `${page.metaDescription.length} caractères (max recommandé: 160)`, 'LOW');
    }
    
    // Meta keywords (obsolète)
    if (page.metaKeywords) {
      this.addOpportunity(page.url, 'Meta keywords présent', 'Cette balise est obsolète et peut être retirée', 'LOW');
    }
    
    // Canonical
    if (!page.canonical) {
      this.addOpportunity(page.url, 'Canonical manquant', 'Considérez ajouter une balise canonical', 'MEDIUM');
    }
    
    // Open Graph
    if (!page.ogTitle || !page.ogDescription || !page.ogImage) {
      this.addOpportunity(page.url, 'Open Graph incomplet', 'Optimisez pour le partage sur les réseaux sociaux', 'LOW');
    }
  }

  checkHeadings(page) {
    // H1
    if (page.h1.length === 0) {
      this.addError(page.url, 'H1 manquant', 'Aucune balise H1 détectée', 'HIGH');
    } else if (page.h1.length > 1) {
      this.addWarning(page.url, 'Plusieurs H1', `${page.h1.length} balises H1 (recommandé: 1 seule)`, 'MEDIUM');
    } else if (page.h1[0].length > 70) {
      this.addWarning(page.url, 'H1 trop long', `${page.h1[0].length} caractères (max recommandé: 70)`, 'LOW');
    }
    
    // Sous-titres
    if (page.h2Count === 0 && page.wordCount > 300) {
      this.addOpportunity(page.url, 'Aucun H2', 'Structurez votre contenu avec des sous-titres', 'MEDIUM');
    }
  }

  checkContent(page) {
    // Contenu trop court
    if (page.wordCount < 300 && page.statusCode === 200) {
      this.addWarning(page.url, 'Contenu court', `${page.wordCount} mots (min recommandé: 300)`, 'MEDIUM');
    }
    
    // Pas de contenu
    if (page.wordCount < 50) {
      this.addError(page.url, 'Contenu très faible', 'Page quasi-vide', 'HIGH');
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
        this.addWarning(page.url, `Image ${index + 1} sans alt`, 'Attribut alt manquant pour l\'accessibilité', 'MEDIUM');
      } else if (img.alt.length > 125) {
        this.addWarning(page.url, `Image ${index + 1} alt trop long`, `${img.alt.length} caractères`, 'LOW');
      }
      
      // Dimensions manquantes
      if (!img.width || !img.height) {
        this.addOpportunity(page.url, `Image ${index + 1} sans dimensions`, 'Ajoutez width/height pour éviter le CLS', 'MEDIUM');
      }
      
      // Lazy loading
      if (index > 2 && img.loading !== 'lazy') {
        this.addOpportunity(page.url, `Image ${index + 1} pas en lazy load`, 'Améliorer les performances', 'LOW');
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
  }

  addError(url, title, description, priority) {
    this.issues.errors.push({ url, title, description, priority, type: 'error' });
  }

  addWarning(url, title, description, priority) {
    this.issues.warnings.push({ url, title, description, priority, type: 'warning' });
  }

  addOpportunity(url, title, description, priority) {
    this.issues.opportunities.push({ url, title, description, priority, type: 'opportunity' });
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
