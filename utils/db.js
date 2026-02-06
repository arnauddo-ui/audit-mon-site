const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion
pool.on('connect', () => {
  console.log('📦 Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

// Initialisation des tables
const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Table Users (prête pour V2)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        tokens INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Table Audits
    await client.query(`
      CREATE TABLE IF NOT EXISTS audits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        score INTEGER,
        total_pages INTEGER DEFAULT 0,
        total_errors INTEGER DEFAULT 0,
        total_warnings INTEGER DEFAULT 0,
        total_opportunities INTEGER DEFAULT 0,
        crawl_data JSONB,
        issues JSONB,
        web_vitals JSONB,
        ppt_path VARCHAR(500),
        tokens_used INTEGER DEFAULT 1,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Index pour performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits(user_id);
      CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
      CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);
    `);
    
    // Table Transactions (V2 - pour Stripe)
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        stripe_payment_id VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        tokens INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Créer l'admin par défaut si n'existe pas
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@auditmonsite.fr';
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'changeme123', 10);
    
    await client.query(`
      INSERT INTO users (email, password, is_admin, tokens)
      VALUES ($1, $2, true, 999999)
      ON CONFLICT (email) DO NOTHING
    `, [adminEmail, hashedPassword]);
    
    await client.query('COMMIT');
    console.log('✅ Tables créées/vérifiées avec succès');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur initialisation BDD:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Helper functions
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Query:', { text, duration: `${duration}ms`, rows: res.rowCount });
  }
  
  return res;
};

const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = {
  pool,
  query,
  getClient,
  initDatabase
};
