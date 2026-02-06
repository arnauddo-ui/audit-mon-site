const express = require('express');
const router = express.Router();
const Audit = require('../models/Audit');
const User = require('../models/User');
const Crawler = require('../services/crawler');
const Analyzer = require('../services/analyzer');
const PageSpeedService = require('../services/pagespeed');
const PPTGenerator = require('../services/pptGenerator');

// Middleware d'authentification (simple pour V1)
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    
    const email = authHeader.split(' ')[1]; // Pour V1, on passe juste l'email
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentification échouée' });
  }
};

// POST /api/audit - Créer un nouvel audit
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL requise' });
    }
    
    // Vérifier si l'URL est valide
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'URL invalide' });
    }
    
    // Créer l'audit en BDD
    const audit = await Audit.create(req.user.id, url);
    
    // Lancer le crawl en arrière-plan
    runAudit(audit.id, url).catch(err => {
      console.error('Erreur audit:', err);
      Audit.markFailed(audit.id, err.message);
    });
    
    res.json({
      message: 'Audit démarré',
      auditId: audit.id,
      status: 'pending'
    });
    
  } catch (error) {
    console.error('Erreur création audit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonction pour exécuter l'audit (asynchrone)
async function runAudit(auditId, url) {
  try {
    console.log(`🚀 Démarrage audit #${auditId} pour ${url}`);
    
    // 1. Crawler le site
    const crawler = new Crawler(url, {
      maxPages: parseInt(process.env.MAX_PAGES_PER_CRAWL) || 10000,
      onProgress: (progress) => {
        console.log(`Crawl progress: ${progress.current}/${progress.total}`);
      }
    });
    
    const crawlResult = await crawler.crawl();
    const pages = crawlResult.pages;
    const metadata = crawlResult.metadata;
    
    if (pages.length === 0) {
      throw new Error('Aucune page crawlée');
    }
    
    // 2. Analyser les pages
    const analyzer = new Analyzer(pages, metadata);
    const analysisResult = await analyzer.analyze();
    
    // 3. Obtenir Web Vitals (seulement pour la homepage)
    let webVitals = null;
    const pageSpeedService = new PageSpeedService();
    
    try {
      webVitals = await pageSpeedService.analyze(url, 'mobile');
    } catch (error) {
      console.error('Erreur PageSpeed:', error.message);
    }
    
    // 4. Générer le PowerPoint
    const pptData = {
      url,
      score: analysisResult.score,
      totalPages: pages.length,
      totalErrors: analysisResult.issues.errors.length,
      totalWarnings: analysisResult.issues.warnings.length,
      totalOpportunities: analysisResult.issues.opportunities.length,
      issues: analysisResult.issues,
      webVitals,
      crawlData: pages
    };
    
    const pptGenerator = new PPTGenerator(pptData);
    const pptPath = await pptGenerator.generate();
    
    // 5. Calculer tokens utilisés
    const tokensUsed = Math.ceil(pages.length / 500);
    
    // 6. Sauvegarder les résultats
    await Audit.saveResults(auditId, {
      score: analysisResult.score,
      totalPages: pages.length,
      totalErrors: analysisResult.issues.errors.length,
      totalWarnings: analysisResult.issues.warnings.length,
      totalOpportunities: analysisResult.issues.opportunities.length,
      crawlData: pages,
      issues: analysisResult.issues,
      webVitals,
      pptPath,
      tokensUsed
    });
    
    console.log(`✅ Audit #${auditId} terminé avec succès`);
    
  } catch (error) {
    console.error(`❌ Erreur audit #${auditId}:`, error);
    await Audit.markFailed(auditId, error.message);
    throw error;
  }
}

// GET /api/audit/:id - Récupérer un audit
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    
    if (!audit) {
      return res.status(404).json({ error: 'Audit non trouvé' });
    }
    
    // Vérifier que l'audit appartient à l'utilisateur (sauf admin)
    if (audit.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    res.json(audit);
    
  } catch (error) {
    console.error('Erreur récupération audit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/audit - Lister les audits de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const audits = await Audit.findByUser(req.user.id);
    res.json(audits);
    
  } catch (error) {
    console.error('Erreur liste audits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/audit/:id - Supprimer un audit
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    
    if (!audit) {
      return res.status(404).json({ error: 'Audit non trouvé' });
    }
    
    // Vérifier que l'audit appartient à l'utilisateur (sauf admin)
    if (audit.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    await Audit.delete(req.params.id);
    res.json({ message: 'Audit supprimé' });
    
  } catch (error) {
    console.error('Erreur suppression audit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/audits/:id/compare - Comparer avec audits précédents
router.get('/:id/compare', authMiddleware, async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    
    if (!audit) {
      return res.status(404).json({ error: 'Audit non trouvé' });
    }
    
    // Récupérer les 5 audits précédents de la même URL
    const previousAudits = await Audit.getRecentForComparison(
      audit.user_id,
      audit.url,
      5
    );
    
    res.json({
      current: audit,
      previous: previousAudits
    });
    
  } catch (error) {
    console.error('Erreur comparaison:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/audits/:id/download - Télécharger le PowerPoint
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    
    if (!audit) {
      return res.status(404).json({ error: 'Audit non trouvé' });
    }
    
    // Vérifier que l'audit appartient à l'utilisateur (sauf admin)
    if (audit.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    if (audit.status !== 'completed') {
      return res.status(400).json({ error: 'L\'audit n\'est pas terminé' });
    }
    
    const path = require('path');
    const fs = require('fs');
    const PPTGenerator = require('../services/pptGenerator');
    
    let filePath = null;
    
    // Si le PowerPoint existe déjà, l'utiliser
    if (audit.ppt_path) {
      filePath = path.join(__dirname, '..', audit.ppt_path);
    }
    
    // Si le fichier n'existe pas, le régénérer
    if (!filePath || !fs.existsSync(filePath)) {
      console.log('PowerPoint introuvable, régénération...');
      
      // Parser les données de l'audit
      const issues = typeof audit.issues === 'string' ? JSON.parse(audit.issues) : audit.issues;
      const crawlData = typeof audit.crawl_data === 'string' ? JSON.parse(audit.crawl_data) : audit.crawl_data;
      
      // Régénérer le PowerPoint
      const generator = new PPTGenerator();
      filePath = await generator.generate({
        url: audit.url,
        score: audit.score || 0,
        totalPages: audit.total_pages || 0,
        totalErrors: audit.total_errors || 0,
        totalWarnings: audit.total_warnings || 0,
        totalOpportunities: audit.total_opportunities || 0,
        issues: issues,
        crawlData: crawlData
      });
      
      // Mettre à jour le chemin dans la base de données
      await Audit.updatePptPath(audit.id, filePath);
    }
    
    res.download(filePath, `audit_${audit.url.replace(/https?:\/\//, '')}_${audit.id}.pptx`);
    
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du PowerPoint' });
  }
});

module.exports = router;
