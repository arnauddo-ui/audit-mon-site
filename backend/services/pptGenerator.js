const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs').promises;

class PPTGenerator {
  constructor(auditData) {
    this.auditData = auditData;
    this.ppt = new PptxGenJS();
    
    // Configuration
    this.ppt.layout = 'LAYOUT_16x9';
    this.ppt.author = 'Audit Mon Site';
    this.ppt.company = 'Audit Mon Site';
    this.ppt.subject = `Audit SEO de ${auditData.url}`;
    this.ppt.title = `Audit SEO Technique - ${auditData.url}`;
    
    // Couleurs
    this.colors = {
      primary: '2C3E50',
      success: '27AE60',
      warning: 'F39C12',
      danger: 'E74C3C',
      info: '3498DB',
      white: 'FFFFFF',
      lightGray: 'ECF0F1',
      darkGray: '7F8C8D'
    };
  }

  async generate() {
    console.log('📄 Génération du PowerPoint...');
    
    // Page 1: Couverture
    this.addCoverSlide();
    
    // Page 2: Résumé exécutif
    this.addExecutiveSummary();
    
    // Page 3: Scores par catégorie
    this.addScoresSlide();
    
    // Page 4-6: Erreurs critiques
    this.addErrorsSlides();
    
    // Page 7-9: Warnings
    this.addWarningsSlides();
    
    // Page 10-12: Opportunités
    this.addOpportunitiesSlides();
    
    // Page 13: Web Vitals
    if (this.auditData.webVitals) {
      this.addWebVitalsSlide();
    }
    
    // Page 14: Structure du site
    this.addSiteStructureSlide();
    
    // Dernière page: Checklist actions
    this.addActionChecklistSlide();
    
    // Sauvegarder
    const fileName = `audit_${Date.now()}.pptx`;
    const exportDir = path.join(__dirname, '../../exports');
    
    // Créer le dossier exports s'il n'existe pas
    await fs.mkdir(exportDir, { recursive: true });
    
    const filePath = path.join(exportDir, fileName);
    
    // Écrire le fichier PowerPoint
    await this.ppt.writeFile(filePath);
    
    console.log(`✅ PowerPoint généré: ${fileName}`);
    return `exports/${fileName}`;
  }

  addCoverSlide() {
    const slide = this.ppt.addSlide();
    
    // Fond
    slide.background = { color: this.colors.primary };
    
    // Titre
    slide.addText('Audit SEO Technique', {
      x: 1,
      y: 2,
      w: 10,
      h: 1.5,
      fontSize: 48,
      bold: true,
      color: this.colors.white,
      align: 'center'
    });
    
    // URL
    slide.addText(this.auditData.url, {
      x: 1,
      y: 3.7,
      w: 10,
      h: 0.8,
      fontSize: 24,
      color: this.colors.lightGray,
      align: 'center'
    });
    
    // Score global
    const scoreColor = this.getScoreColor(this.auditData.score);
    slide.addText(`Score: ${this.auditData.score}/100`, {
      x: 1,
      y: 4.8,
      w: 10,
      h: 1,
      fontSize: 36,
      bold: true,
      color: scoreColor,
      align: 'center'
    });
    
    // Date
    slide.addText(new Date().toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }), {
      x: 1,
      y: 6.5,
      w: 10,
      h: 0.5,
      fontSize: 16,
      color: this.colors.lightGray,
      align: 'center'
    });
  }

  addExecutiveSummary() {
    const slide = this.ppt.addSlide();
    
    slide.addText('Résumé Exécutif', {
      x: 0.5,
      y: 0.3,
      w: 11,
      h: 0.7,
      fontSize: 32,
      bold: true,
      color: this.colors.primary
    });
    
    // Stats principales
    const stats = [
      { label: 'Pages analysées', value: this.auditData.totalPages },
      { label: 'Erreurs critiques', value: this.auditData.totalErrors, color: this.colors.danger },
      { label: 'Avertissements', value: this.auditData.totalWarnings, color: this.colors.warning },
      { label: 'Opportunités', value: this.auditData.totalOpportunities, color: this.colors.info }
    ];
    
    let yPos = 1.5;
    stats.forEach(stat => {
      slide.addText(stat.label, {
        x: 1,
        y: yPos,
        w: 5,
        h: 0.6,
        fontSize: 18,
        color: this.colors.darkGray
      });
      
      slide.addText(String(stat.value), {
        x: 7,
        y: yPos,
        w: 3,
        h: 0.6,
        fontSize: 24,
        bold: true,
        color: stat.color || this.colors.primary,
        align: 'right'
      });
      
      yPos += 0.8;
    });
    
    // Top 5 problèmes
    slide.addText('Top 5 Problèmes Prioritaires', {
      x: 0.5,
      y: 4.5,
      w: 11,
      h: 0.6,
      fontSize: 20,
      bold: true,
      color: this.colors.primary
    });
    
    const topIssues = this.getTopIssues(5);
    let issueY = 5.3;
    topIssues.forEach((issue, index) => {
      slide.addText(`${index + 1}. ${issue.title}`, {
        x: 1,
        y: issueY,
        w: 10,
        h: 0.4,
        fontSize: 14,
        color: this.colors.darkGray
      });
      issueY += 0.5;
    });
  }

  addScoresSlide() {
    const slide = this.ppt.addSlide();
    
    slide.addText('Scores Détaillés', {
      x: 0.5,
      y: 0.3,
      w: 11,
      h: 0.7,
      fontSize: 32,
      bold: true,
      color: this.colors.primary
    });
    
    // Graphique des scores
    if (this.auditData.webVitals) {
      const chartData = [
        {
          name: 'Scores',
          labels: ['Performance', 'Accessibilité', 'Best Practices', 'SEO'],
          values: [
            this.auditData.webVitals.performanceScore || 0,
            this.auditData.webVitals.accessibilityScore || 0,
            this.auditData.webVitals.bestPracticesScore || 0,
            this.auditData.webVitals.seoScore || 0
          ]
        }
      ];
      
      slide.addChart(this.ppt.ChartType.bar, chartData, {
        x: 1,
        y: 1.5,
        w: 10,
        h: 4,
        barDir: 'bar',
        showValue: true,
        valAxisMaxVal: 100,
        chartColors: [this.colors.info]
      });
    }
  }

  addErrorsSlides() {
    const errors = this.auditData.issues.errors || [];
    const criticalErrors = errors.filter(e => e.priority === 'CRITICAL');
    const highErrors = errors.filter(e => e.priority === 'HIGH');
    
    if (criticalErrors.length > 0) {
      this.addIssueSlide('Erreurs Critiques', criticalErrors, this.colors.danger);
    }
    
    if (highErrors.length > 0) {
      this.addIssueSlide('Erreurs Importantes', highErrors, this.colors.danger);
    }
    
    const otherErrors = errors.filter(e => e.priority !== 'CRITICAL' && e.priority !== 'HIGH');
    if (otherErrors.length > 0) {
      this.addIssueSlide('Autres Erreurs', otherErrors, this.colors.danger);
    }
  }

  addWarningsSlides() {
    const warnings = this.auditData.issues.warnings || [];
    const chunks = this.chunkArray(warnings, 8);
    
    chunks.forEach((chunk, index) => {
      const title = chunks.length > 1 ? `Avertissements (${index + 1}/${chunks.length})` : 'Avertissements';
      this.addIssueSlide(title, chunk, this.colors.warning);
    });
  }

  addOpportunitiesSlides() {
    const opportunities = this.auditData.issues.opportunities || [];
    const chunks = this.chunkArray(opportunities, 8);
    
    chunks.forEach((chunk, index) => {
      const title = chunks.length > 1 ? `Opportunités (${index + 1}/${chunks.length})` : 'Opportunités';
      this.addIssueSlide(title, chunk, this.colors.info);
    });
  }

  addIssueSlide(title, issues, color) {
    const slide = this.ppt.addSlide();
    
    slide.addText(title, {
      x: 0.5,
      y: 0.3,
      w: 11,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: color
    });
    
    let yPos = 1.2;
    issues.slice(0, 8).forEach((issue, index) => {
      // Titre de l'issue
      slide.addText(`• ${issue.title}`, {
        x: 0.7,
        y: yPos,
        w: 10.5,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: this.colors.primary
      });
      
      // Description
      slide.addText(issue.description, {
        x: 1,
        y: yPos + 0.4,
        w: 10.2,
        h: 0.3,
        fontSize: 11,
        color: this.colors.darkGray
      });
      
      yPos += 0.85;
    });
  }

  addWebVitalsSlide() {
    const slide = this.ppt.addSlide();
    
    slide.addText('Core Web Vitals', {
      x: 0.5,
      y: 0.3,
      w: 11,
      h: 0.7,
      fontSize: 32,
      bold: true,
      color: this.colors.primary
    });
    
    const vitals = this.auditData.webVitals.metrics;
    
    const vitalData = [
      { name: 'LCP', value: vitals.lcp.displayValue, rating: vitals.lcp.rating },
      { name: 'FID/TBT', value: vitals.fid.displayValue, rating: vitals.fid.rating },
      { name: 'CLS', value: vitals.cls.displayValue, rating: vitals.cls.rating },
      { name: 'FCP', value: vitals.fcp.displayValue, rating: 'info' },
      { name: 'TTFB', value: vitals.ttfb.displayValue, rating: 'info' }
    ];
    
    let yPos = 1.5;
    vitalData.forEach(vital => {
      const ratingColor = this.getRatingColor(vital.rating);
      
      slide.addText(vital.name, {
        x: 1,
        y: yPos,
        w: 3,
        h: 0.6,
        fontSize: 18,
        bold: true,
        color: this.colors.primary
      });
      
      slide.addText(vital.value, {
        x: 5,
        y: yPos,
        w: 3,
        h: 0.6,
        fontSize: 16,
        color: this.colors.darkGray
      });
      
      slide.addShape(this.ppt.ShapeType.rect, {
        x: 9,
        y: yPos + 0.1,
        w: 1.5,
        h: 0.4,
        fill: { color: ratingColor }
      });
      
      yPos += 0.9;
    });
  }

  addSiteStructureSlide() {
    const slide = this.ppt.addSlide();
    
    slide.addText('Structure du Site', {
      x: 0.5,
      y: 0.3,
      w: 11,
      h: 0.7,
      fontSize: 32,
      bold: true,
      color: this.colors.primary
    });
    
    // Informations structurelles
    slide.addText(`Total de pages crawlées: ${this.auditData.totalPages}`, {
      x: 1,
      y: 1.5,
      w: 10,
      h: 0.5,
      fontSize: 16,
      color: this.colors.darkGray
    });
    
    slide.addText('Recommandations:', {
      x: 1,
      y: 2.5,
      w: 10,
      h: 0.5,
      fontSize: 18,
      bold: true,
      color: this.colors.primary
    });
    
    const recommendations = [
      'Optimiser la profondeur de crawl (max 3 clics depuis la homepage)',
      'Corriger tous les liens cassés (404)',
      'Éliminer les chaînes de redirections',
      'Assurer que toutes les pages importantes sont accessibles'
    ];
    
    let yPos = 3.2;
    recommendations.forEach(rec => {
      slide.addText(`• ${rec}`, {
        x: 1.2,
        y: yPos,
        w: 9.8,
        h: 0.4,
        fontSize: 14,
        color: this.colors.darkGray
      });
      yPos += 0.6;
    });
  }

  addActionChecklistSlide() {
    const slide = this.ppt.addSlide();
    
    slide.addText('Plan d\'Action Prioritaire', {
      x: 0.5,
      y: 0.3,
      w: 11,
      h: 0.7,
      fontSize: 32,
      bold: true,
      color: this.colors.primary
    });
    
    const actions = this.getTopIssues(10).map((issue, index) => ({
      priority: index + 1,
      action: issue.title,
      impact: issue.priority
    }));
    
    let yPos = 1.3;
    actions.forEach(action => {
      slide.addText(`${action.priority}.`, {
        x: 0.7,
        y: yPos,
        w: 0.5,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: this.colors.primary
      });
      
      slide.addText(action.action, {
        x: 1.3,
        y: yPos,
        w: 8.5,
        h: 0.4,
        fontSize: 13,
        color: this.colors.darkGray
      });
      
      slide.addText(action.impact, {
        x: 10,
        y: yPos,
        w: 1.2,
        h: 0.4,
        fontSize: 11,
        color: this.getPriorityColor(action.impact),
        align: 'center'
      });
      
      yPos += 0.55;
    });
  }

  // Helpers
  getTopIssues(count) {
    const all = [
      ...this.auditData.issues.errors.map(e => ({ ...e, weight: this.getPriorityWeight(e.priority) + 100 })),
      ...this.auditData.issues.warnings.map(w => ({ ...w, weight: this.getPriorityWeight(w.priority) + 50 })),
      ...this.auditData.issues.opportunities.map(o => ({ ...o, weight: this.getPriorityWeight(o.priority) }))
    ];
    
    return all.sort((a, b) => b.weight - a.weight).slice(0, count);
  }

  getPriorityWeight(priority) {
    const weights = { CRITICAL: 40, HIGH: 30, MEDIUM: 20, LOW: 10 };
    return weights[priority] || 0;
  }

  getScoreColor(score) {
    if (score >= 80) return this.colors.success;
    if (score >= 60) return this.colors.warning;
    return this.colors.danger;
  }

  getRatingColor(rating) {
    if (rating === 'good') return this.colors.success;
    if (rating === 'needs-improvement') return this.colors.warning;
    if (rating === 'poor') return this.colors.danger;
    return this.colors.info;
  }

  getPriorityColor(priority) {
    if (priority === 'CRITICAL' || priority === 'HIGH') return this.colors.danger;
    if (priority === 'MEDIUM') return this.colors.warning;
    return this.colors.info;
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

module.exports = PPTGenerator;
