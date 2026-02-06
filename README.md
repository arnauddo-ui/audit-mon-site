# 🚀 Audit Mon Site - Outil d'Audit SEO Technique

Outil complet d'audit SEO technique avec crawl de site, analyse de 300+ points de contrôle et génération automatique de rapport PowerPoint.

## 📋 Fonctionnalités V1

### ✅ Crawler Complet
- Crawl illimité de pages (configurable)
- Analyse technique approfondie de chaque page
- Gestion des redirections, erreurs 404/500
- Support JavaScript (optionnel)

### ✅ Analyses (300+ vérifications)
**Meta Tags:**
- Title, meta description (longueur, duplication)
- Open Graph, Twitter Cards
- Canonical, robots, hreflang

**Structure:**
- Balises Hn (H1, H2, H3...)
- Profondeur de crawl
- Pages orphelines
- Liens internes/externes

**Images:**
- Alt text
- Poids et format
- Lazy loading
- Dimensions

**Performance:**
- Core Web Vitals (LCP, FID, CLS)
- TTFB, FCP, Speed Index
- Via Google PageSpeed Insights

**Contenu:**
- Nombre de mots
- Contenu dupliqué
- Pages thin

**Sécurité:**
- HTTPS
- Mixed content
- Certificat SSL

**Schema & SEO:**
- JSON-LD, Microdata
- Données structurées

### ✅ Export PowerPoint Automatique
- Résumé exécutif avec score global
- Graphiques visuels des scores
- Liste détaillée des erreurs/warnings/opportunités
- Core Web Vitals
- Structure du site
- Plan d'action prioritaire

### ✅ Interface Admin
- Dashboard avec statistiques
- Liste des audits avec historique
- Comparaison entre audits
- Téléchargement des rapports

---

## 🛠️ Stack Technique

**Backend:**
- Node.js + Express
- PostgreSQL
- Puppeteer (crawl JavaScript)
- Cheerio (parsing HTML)
- PptxGenJS (génération PowerPoint)
- Google PageSpeed Insights API

**Frontend:**
- Next.js 14
- React 18
- TailwindCSS
- Axios
- React Query

---

## 📦 Installation Locale

### Prérequis
- Node.js 18+ ([télécharger](https://nodejs.org/))
- PostgreSQL 13+ ([télécharger](https://www.postgresql.org/download/))
- Redis (optionnel pour V1)

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd audit-mon-site
```

### 2. Installer les dépendances
```bash
npm run install:all
```

### 3. Configuration de la base de données
Créer une base de données PostgreSQL:
```sql
CREATE DATABASE audit_mon_site;
```

### 4. Variables d'environnement
Copier `.env.example` vers `.env` et configurer:
```bash
cp .env.example .env
```

Modifier `.env`:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://user:password@localhost:5432/audit_mon_site

ADMIN_EMAIL=arnaud.doguet@gmail.com
ADMIN_PASSWORD=votre_mot_de_passe_securise

# Optionnel: Clé API Google PageSpeed
PAGESPEED_API_KEY=votre_cle_api

# V2 (commenté pour l'instant)
# STRIPE_SECRET_KEY=sk_test_...
```

### 5. Lancer en développement
```bash
npm run dev
```

Cela va démarrer:
- Backend sur `http://localhost:5000`
- Frontend sur `http://localhost:3000`

### 6. Première connexion
- URL: `http://localhost:3000`
- Email: `arnaud.doguet@gmail.com`
- Mot de passe: celui défini dans `.env`

---

## 🚀 Déploiement sur Railway

### Étape 1: Préparer le code
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Étape 2: Créer un compte Railway
1. Aller sur [railway.app](https://railway.app)
2. S'inscrire avec GitHub
3. Connecter votre repository

### Étape 3: Créer le projet
1. Cliquer sur "New Project"
2. Sélectionner "Deploy from GitHub repo"
3. Choisir votre repository

### Étape 4: Ajouter PostgreSQL
1. Dans le projet, cliquer "New"
2. Sélectionner "Database"
3. Choisir "PostgreSQL"
4. Railway va créer la BDD et la variable `DATABASE_URL`

### Étape 5: Configurer les variables d'environnement
Dans les Settings du service, ajouter:
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://votre-app.up.railway.app

ADMIN_EMAIL=arnaud.doguet@gmail.com
ADMIN_PASSWORD=votre_mot_de_passe_securise

PAGESPEED_API_KEY=votre_cle_api
```

### Étape 6: Configurer le build
Railway détecte automatiquement Node.js. Pour le frontend:
1. Créer un nouveau service pour le frontend
2. Build Command: `cd frontend && npm install && npm run build`
3. Start Command: `cd frontend && npm start`

### Étape 7: Déployer
Railway va automatiquement déployer à chaque push sur `main`.

Votre app sera disponible sur: `https://votre-app.up.railway.app`

**Coût estimé:** 5-20$/mois selon l'utilisation

---

## 📖 Utilisation

### 1. Créer un audit
1. Se connecter au dashboard
2. Cliquer sur "Nouvel Audit"
3. Entrer l'URL du site (ex: `https://example.com`)
4. Cliquer sur "Lancer l'audit"

### 2. Suivre la progression
- L'audit démarre en arrière-plan
- La page se met à jour automatiquement toutes les 5 secondes
- Temps estimé: 5-30 minutes selon la taille du site

### 3. Consulter les résultats
- Score global sur 100
- Statistiques (erreurs, warnings, opportunités)
- Core Web Vitals
- Liste détaillée des problèmes

### 4. Télécharger le rapport
- Cliquer sur "Télécharger le PowerPoint"
- Le fichier .pptx contient:
  - Résumé exécutif
  - Scores détaillés
  - Problèmes par catégorie
  - Web Vitals
  - Plan d'action

---

## 🔧 API Google PageSpeed (Optionnel)

Pour obtenir les Core Web Vitals, vous avez besoin d'une clé API Google:

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet
3. Activer l'API "PageSpeed Insights"
4. Créer une clé API
5. Ajouter la clé dans `.env`:
```env
PAGESPEED_API_KEY=AIza...
```

**Sans clé API:** L'outil fonctionne mais sans les Web Vitals.

---

## 📂 Structure du Projet

```
audit-mon-site/
├── backend/
│   ├── models/           # Modèles BDD
│   ├── routes/           # Routes API
│   ├── services/         # Logique métier
│   │   ├── crawler.js    # Crawler de site
│   │   ├── analyzer.js   # Analyse SEO
│   │   ├── pagespeed.js  # Web Vitals
│   │   └── pptGenerator.js # Génération PPT
│   ├── utils/            # Utilitaires
│   └── server.js         # Serveur Express
│
├── frontend/
│   ├── pages/            # Pages Next.js
│   │   ├── index.js      # Login
│   │   ├── dashboard.js  # Dashboard
│   │   ├── new-audit.js  # Nouveau audit
│   │   └── audit/[id].js # Résultats
│   ├── components/       # Composants React
│   └── styles/           # CSS
│
├── exports/              # Fichiers PPT générés
├── package.json
├── .env.example
└── README.md
```

---

## 🔐 Sécurité

### Changer le mot de passe admin
Après la première connexion, changez immédiatement le mot de passe:

1. Modifier `.env`:
```env
ADMIN_PASSWORD=nouveau_mot_de_passe_tres_securise
```

2. Redémarrer le serveur
3. La BDD sera mise à jour au démarrage

### Best Practices
- Utiliser un mot de passe fort (12+ caractères)
- Ne jamais commiter le fichier `.env`
- En production, utiliser des secrets Railway/Vercel

---

## 🎯 Roadmap V2 (Prévu)

### Fonctionnalités à venir
- ✅ Multi-utilisateurs avec inscription
- ✅ Système de tokens (1€ = 1 token)
- ✅ Paiement Stripe intégré
- ✅ Panel admin complet:
  - Gestion des users
  - Modification tokens
  - Reset passwords
  - Statistiques globales
- ✅ Quotas & Rate limiting
- ✅ Emails automatiques
- ✅ Comparaison d'audits dans le temps

**Facilité de migration V1 → V2:**
- Architecture déjà prête
- Routes commentées à décommenter
- Models déjà créés
- Juste ajouter Stripe et activer

---

## 🐛 Dépannage

### Erreur de connexion BDD
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Vérifier que PostgreSQL est démarré

### Erreur de crawl
```bash
Error: Navigation timeout
```
**Solution:** Augmenter `CRAWL_TIMEOUT` dans `.env`

### Erreur mémoire
```bash
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
```
**Solution:** Limiter `MAX_PAGES_PER_CRAWL` ou augmenter mémoire Node:
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

### Puppeteer ne fonctionne pas
**Solution:** Installer les dépendances système:
```bash
# Ubuntu/Debian
sudo apt-get install -y chromium-browser

# Mac
brew install chromium
```

---

## 📞 Support

**Email:** arnaud.doguet@gmail.com

**Issues GitHub:** [Lien vers votre repo]

---

## 📄 Licence

MIT License - Voir le fichier LICENSE

---

## 🙏 Crédits

Développé par Arnaud Doguet avec ❤️

Technologies utilisées:
- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)

---

**Bon audit ! 🚀**
