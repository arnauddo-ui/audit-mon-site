const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Audit = require('../models/Audit');

// Middleware admin
const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    
    const email = authHeader.split(' ')[1];
    const user = await User.findByEmail(email);
    
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'Accès admin requis' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentification échouée' });
  }
};

// POST /api/admin/login - Connexion admin (V1)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const isValid = await User.verifyPassword(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    if (!user.is_admin) {
      return res.status(403).json({ error: 'Accès admin requis' });
    }
    
    // Pour V1, on retourne juste l'email comme token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin,
        tokens: user.tokens
      },
      token: user.email // Simple pour V1
    });
    
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/stats - Statistiques globales
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const stats = await Audit.getGlobalStats();
    const users = await User.findAll();
    
    res.json({
      ...stats,
      total_users: users.length,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        tokens: u.tokens,
        created_at: u.created_at
      }))
    });
    
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/audits - Lister tous les audits
router.get('/audits', adminMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const audits = await Audit.findAll(limit);
    
    res.json(audits);
    
  } catch (error) {
    console.error('Erreur liste audits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/users - Lister tous les utilisateurs (V2)
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
    
  } catch (error) {
    console.error('Erreur liste users:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/users/:id/tokens - Modifier les tokens d'un user (V2)
router.put('/users/:id/tokens', adminMiddleware, async (req, res) => {
  try {
    const { tokens } = req.body;
    const userId = parseInt(req.params.id);
    
    if (typeof tokens !== 'number') {
      return res.status(400).json({ error: 'Nombre de tokens invalide' });
    }
    
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const difference = tokens - currentUser.tokens;
    let updatedUser;
    
    if (difference > 0) {
      updatedUser = await User.addTokens(userId, difference);
    } else if (difference < 0) {
      updatedUser = await User.useTokens(userId, Math.abs(difference));
    } else {
      updatedUser = currentUser;
    }
    
    res.json(updatedUser);
    
  } catch (error) {
    console.error('Erreur modification tokens:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/users/:id/password - Modifier le mot de passe (V2)
router.put('/users/:id/password', adminMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = parseInt(req.params.id);
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Mot de passe trop court (min 6 caractères)' });
    }
    
    await User.updatePassword(userId, newPassword);
    
    res.json({ message: 'Mot de passe mis à jour' });
    
  } catch (error) {
    console.error('Erreur modification password:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
