const { query } = require('../utils/db');

class Audit {
  // Créer un audit
  static async create(userId, url) {
    const result = await query(
      `INSERT INTO audits (user_id, url, status, started_at) 
       VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP) 
       RETURNING *`,
      [userId, url]
    );
    return result.rows[0];
  }
  
  // Mettre à jour le statut
  static async updateStatus(id, status) {
    const result = await query(
      'UPDATE audits SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
  
  // Sauvegarder les résultats
  static async saveResults(id, data) {
    const {
      score,
      totalPages,
      totalErrors,
      totalWarnings,
      totalOpportunities,
      crawlData,
      issues,
      webVitals,
      pptPath,
      tokensUsed
    } = data;
    
    const result = await query(
      `UPDATE audits SET 
        status = 'completed',
        score = $1,
        total_pages = $2,
        total_errors = $3,
        total_warnings = $4,
        total_opportunities = $5,
        crawl_data = $6,
        issues = $7,
        web_vitals = $8,
        ppt_path = $9,
        tokens_used = $10,
        completed_at = CURRENT_TIMESTAMP
      WHERE id = $11 RETURNING *`,
      [
        score,
        totalPages,
        totalErrors,
        totalWarnings,
        totalOpportunities,
        JSON.stringify(crawlData),
        JSON.stringify(issues),
        JSON.stringify(webVitals),
        pptPath,
        tokensUsed,
        id
      ]
    );
    return result.rows[0];
  }
  
  // Marquer comme échoué
  static async markFailed(id, errorMessage) {
    const result = await query(
      `UPDATE audits SET 
        status = 'failed',
        crawl_data = $1,
        completed_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *`,
      [JSON.stringify({ error: errorMessage }), id]
    );
    return result.rows[0];
  }
  
  // Trouver par ID
  static async findById(id) {
    const result = await query('SELECT * FROM audits WHERE id = $1', [id]);
    return result.rows[0];
  }
  
  // Lister par utilisateur
  static async findByUser(userId, limit = 50) {
    const result = await query(
      `SELECT * FROM audits 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
  
  // Lister tous (admin)
  static async findAll(limit = 100) {
    const result = await query(
      `SELECT a.*, u.email as user_email 
       FROM audits a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
  
  // Statistiques globales
  static async getGlobalStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_audits,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_audits,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_audits,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_audits,
        AVG(CASE WHEN status = 'completed' THEN score END) as avg_score,
        SUM(total_pages) as total_pages_crawled,
        SUM(tokens_used) as total_tokens_used
      FROM audits
    `);
    return result.rows[0];
  }
  
  // Supprimer un audit
  static async delete(id) {
    await query('DELETE FROM audits WHERE id = $1', [id]);
  }
  
  // Récupérer les audits récents pour comparaison
  static async getRecentForComparison(userId, url, limit = 5) {
    const result = await query(
      `SELECT * FROM audits 
       WHERE user_id = $1 AND url = $2 AND status = 'completed'
       ORDER BY created_at DESC 
       LIMIT $3`,
      [userId, url, limit]
    );
    return result.rows;
  }
  
  // Mettre à jour le chemin du PowerPoint
  static async updatePptPath(id, pptPath) {
    const result = await query(
      'UPDATE audits SET ppt_path = $1 WHERE id = $2 RETURNING *',
      [pptPath, id]
    );
    return result.rows[0];
  }
}

module.exports = Audit;
