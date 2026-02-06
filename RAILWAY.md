# 🚂 Guide de Déploiement Railway - Audit Mon Site

## Déploiement en 10 minutes ⏱️

### 1️⃣ Créer un compte Railway
- Aller sur [railway.app](https://railway.app)
- S'inscrire avec GitHub
- Autoriser l'accès à vos repos

### 2️⃣ Pousser le code sur GitHub
```bash
# Dans le dossier audit-mon-site
git init
git add .
git commit -m "Initial commit - Audit Mon Site V1"
git branch -M main
git remote add origin https://github.com/votre-username/audit-mon-site.git
git push -u origin main
```

### 3️⃣ Créer le projet Railway
1. Dans Railway, cliquer **"New Project"**
2. Sélectionner **"Deploy from GitHub repo"**
3. Choisir **"audit-mon-site"**

### 4️⃣ Ajouter PostgreSQL
1. Dans le projet Railway, cliquer **"New"**
2. Sélectionner **"Database"** → **"Add PostgreSQL"**
3. Railway crée automatiquement la variable `DATABASE_URL` ✅

### 5️⃣ Configurer le Backend
1. Cliquer sur le service créé
2. Aller dans **"Variables"**
3. Ajouter ces variables:

```env
NODE_ENV=production
PORT=5000
ADMIN_EMAIL=arnaud.doguet@gmail.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123!
PAGESPEED_API_KEY=votre_cle_google_api
JWT_SECRET=un_secret_super_securise_aleatoire_123
MAX_PAGES_PER_CRAWL=10000
```

4. Dans **"Settings"** :
   - Start Command: `node backend/server.js`
   - Build Command: `npm install`

### 6️⃣ Créer le service Frontend
1. Dans le projet, cliquer **"New"** → **"Empty Service"**
2. Connecter le même repo GitHub
3. Dans **"Variables"**, ajouter:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://votre-backend.up.railway.app
NEXT_PUBLIC_ADMIN_EMAIL=arnaud.doguet@gmail.com
```

4. Dans **"Settings"** :
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### 7️⃣ Connecter Backend et Frontend
1. Copier l'URL du backend (ex: `https://audit-backend.up.railway.app`)
2. Coller dans `NEXT_PUBLIC_API_URL` du frontend
3. Ajouter cette URL dans `FRONTEND_URL` du backend

### 8️⃣ Déployer 🚀
Railway détecte automatiquement les changements et déploie:
- ✅ Backend disponible sur `https://xxx-backend.up.railway.app`
- ✅ Frontend disponible sur `https://xxx.up.railway.app`

### 9️⃣ Tester
1. Ouvrir l'URL du frontend
2. Se connecter avec:
   - Email: `arnaud.doguet@gmail.com`
   - Mot de passe: celui configuré dans Railway
3. Créer un premier audit !

---

## 🔧 Configuration Avancée

### Domaine Personnalisé
1. Dans Railway, aller dans **"Settings"** du service
2. Section **"Domains"** → **"Custom Domain"**
3. Ajouter `auditmonsite.fr` (ou votre domaine)
4. Configurer DNS chez votre registrar:
   ```
   Type: CNAME
   Name: @
   Value: xxx.up.railway.app
   ```

### Ajouter Redis (Optionnel pour V1)
1. Cliquer **"New"** → **"Database"** → **"Add Redis"**
2. Variable `REDIS_URL` créée automatiquement

---

## 💰 Coûts Railway

**Plan Gratuit:**
- 5$ de crédit gratuit/mois
- Idéal pour tester

**Plan Payant:**
- 5$/mois de base
- + consommation réelle (CPU/RAM/Network)
- Estimation pour Audit Mon Site: **10-20$/mois**

**Optimisation des coûts:**
- Mettre le frontend sur Vercel (gratuit) si besoin
- Réduire `MAX_PAGES_PER_CRAWL` pour limiter la RAM

---

## 📊 Monitoring

### Logs
Dans Railway:
- Onglet **"Deployments"** → Sélectionner un déploiement
- Voir les logs en temps réel

### Métriques
- CPU usage
- Memory usage
- Network usage
- Tout dans l'onglet **"Metrics"**

---

## 🐛 Dépannage Railway

### Build qui échoue
```
Error: Cannot find module 'xxx'
```
**Solution:** Vérifier que toutes les dépendances sont dans `package.json`

### Database connection failed
```
Error: connect ECONNREFUSED
```
**Solution:** 
1. Vérifier que PostgreSQL est bien ajouté
2. Vérifier que `DATABASE_URL` existe dans les variables
3. Redémarrer le service

### 502 Bad Gateway
**Solution:** 
1. Vérifier les logs
2. S'assurer que le port est bien `process.env.PORT`
3. Vérifier que le serveur démarre sans erreur

---

## 🔄 Mises à jour

Pour déployer une nouvelle version:
```bash
git add .
git commit -m "Mise à jour: description"
git push origin main
```

Railway redéploie automatiquement ! ✨

---

## 📞 Aide

Si problème de déploiement:
1. Vérifier les logs Railway
2. Tester en local d'abord
3. Contacter: arnaud.doguet@gmail.com

---

**Bon déploiement ! 🚂**
