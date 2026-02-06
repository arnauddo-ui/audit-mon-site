const { query } = require('../utils/db');
const bcrypt = require('bcryptjs');

class User {
  // Créer un utilisateur
  static async create(email, password, isAdmin = false) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (email, password, is_admin, tokens) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, isAdmin, isAdmin ? 999999 : 0]
    );
    return result.rows[0];
  }
  
  // Trouver par email
  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }
  
  // Trouver par ID
  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
  
  // Vérifier mot de passe
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Ajouter des tokens
  static async addTokens(userId, amount) {
    const result = await query(
      'UPDATE users SET tokens = tokens + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [amount, userId]
    );
    return result.rows[0];
  }
  
  // Utiliser des tokens
  static async useTokens(userId, amount) {
    const result = await query(
      'UPDATE users SET tokens = tokens - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [amount, userId]
    );
    return result.rows[0];
  }
  
  // Obtenir le solde de tokens
  static async getTokenBalance(userId) {
    const result = await query('SELECT tokens FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.tokens || 0;
  }
  
  // Lister tous les utilisateurs (admin)
  static async findAll() {
    const result = await query('SELECT id, email, is_admin, tokens, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }
  
  // Mettre à jour le mot de passe
  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [hashedPassword, userId]
    );
    return result.rows[0];
  }
  
  // Statistiques utilisateur
  static async getStats(userId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_audits,
        SUM(tokens_used) as total_tokens_used,
        AVG(score) as avg_score
      FROM audits 
      WHERE user_id = $1 AND status = 'completed'
    `, [userId]);
    return result.rows[0];
  }
}

module.exports = User;
