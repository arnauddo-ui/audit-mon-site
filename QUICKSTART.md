# ⚡ Démarrage Rapide - Audit Mon Site

## Installation en 5 minutes

### 1. Prérequis
✅ Node.js 18+ installé ([télécharger](https://nodejs.org/))
✅ PostgreSQL installé et démarré

### 2. Installation
```bash
# Cloner le projet
cd audit-mon-site

# Installer toutes les dépendances
npm run install:all
```

### 3. Base de données
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la BDD
CREATE DATABASE audit_mon_site;
\q
```

### 4. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env
```

**Modifier .env:**
```env
DATABASE_URL=postgresql://postgres:votre_password@localhost:5432/audit_mon_site
ADMIN_EMAIL=arnaud.doguet@gmail.com
ADMIN_PASSWORD=ChangeMoi123!
```

### 5. Lancer 🚀
```bash
# Démarrer backend + frontend
npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 6. Se connecter
- Email: `arnaud.doguet@gmail.com`
- Mot de passe: `ChangeMoi123!` (celui dans .env)

---

## 🎯 Créer votre premier audit

1. Cliquer sur **"Nouvel Audit"**
2. Entrer une URL: `https://example.com`
3. Cliquer **"Lancer l'audit"**
4. Attendre 2-10 minutes
5. Télécharger le PowerPoint !

---

## 🔧 Commandes utiles

```bash
# Développement
npm run dev              # Lancer backend + frontend
npm run dev:backend      # Backend seul
npm run dev:frontend     # Frontend seul

# Production
npm run build:frontend   # Build frontend
npm start                # Lancer en production
```

---

## 📖 Documentation complète

- [README.md](./README.md) - Documentation complète
- [RAILWAY.md](./RAILWAY.md) - Déploiement Railway

---

## ❓ Problèmes fréquents

### "Cannot find module"
```bash
npm run install:all
```

### "Database connection failed"
Vérifier que PostgreSQL est démarré:
```bash
# Mac
brew services start postgresql

# Linux
sudo service postgresql start

# Windows
# Démarrer via pgAdmin
```

### "Port already in use"
Changer les ports dans `.env`:
```env
PORT=5001
```
Et dans `frontend/package.json`:
```json
"dev": "next dev -p 3001"
```

---

**Besoin d'aide ?** arnaud.doguet@gmail.com

**C'est parti ! 🚀**
