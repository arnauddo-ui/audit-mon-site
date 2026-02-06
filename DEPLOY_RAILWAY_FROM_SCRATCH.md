# 🚂 DÉPLOIEMENT RAILWAY DEPUIS ZÉRO - Audit Mon Site

## ⚡ Déploiement en 15 minutes - Pas besoin de local !

---

## ÉTAPE 1 : Préparer GitHub (5 min)

### A. Créer un nouveau repository
1. Aller sur [github.com](https://github.com)
2. Cliquer sur le `+` en haut à droite → **"New repository"**
3. Remplir :
   - Repository name: `audit-mon-site`
   - Description: `Outil d'audit SEO technique`
   - ✅ Cocher **"Public"** ou **"Private"** (au choix)
   - ❌ NE PAS cocher "Add README"
   - ❌ NE PAS cocher ".gitignore"
4. Cliquer **"Create repository"**

### B. Télécharger le code que j'ai créé
1. **Télécharge le dossier complet** "audit-mon-site" depuis nos fichiers partagés
2. **Extraire le ZIP** si nécessaire

### C. Pousser sur GitHub

**Option 1 : Avec GitHub Desktop (le plus simple)**
1. Télécharger [GitHub Desktop](https://desktop.github.com/)
2. Se connecter avec ton compte GitHub
3. File → Add Local Repository
4. Sélectionner le dossier `audit-mon-site`
5. Cliquer "Publish repository"
6. Confirmer

**Option 2 : Avec Git en ligne de commande**
```bash
cd audit-mon-site
git init
git add .
git commit -m "Initial commit - Audit Mon Site"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/audit-mon-site.git
git push -u origin main
```

**✅ Ton code est maintenant sur GitHub !**

---

## ÉTAPE 2 : Créer le compte Railway (2 min)

1. Aller sur [railway.app](https://railway.app)
2. Cliquer **"Login"**
3. Choisir **"Sign in with GitHub"**
4. Autoriser Railway à accéder à GitHub
5. Vérifier ton email si demandé

**✅ Compte Railway créé !**

---

## ÉTAPE 3 : Créer le projet Railway (1 min)

1. Dans Railway, cliquer **"New Project"**
2. Sélectionner **"Deploy from GitHub repo"**
3. Autoriser Railway à accéder à tes repos si demandé
4. Chercher et sélectionner **"audit-mon-site"**
5. Railway va détecter automatiquement que c'est du Node.js

**✅ Projet créé !**

---

## ÉTAPE 4 : Ajouter PostgreSQL (30 sec)

1. Dans ton projet Railway, cliquer sur **"+ New"** (en haut à droite)
2. Sélectionner **"Database"**
3. Choisir **"Add PostgreSQL"**
4. Attendre 10 secondes que la BDD soit créée

**✅ PostgreSQL est prêt !**

Railway crée automatiquement une variable `DATABASE_URL` que le backend utilisera.

---

## ÉTAPE 5 : Configurer le Backend (3 min)

### A. Trouver le service Backend
Dans ton projet Railway, tu devrais voir 2 services :
- **audit-mon-site** (le service principal créé automatiquement)
- **Postgres** (la base de données)

Clique sur le service **"audit-mon-site"**

### B. Ajouter les Variables d'Environnement
1. Aller dans l'onglet **"Variables"**
2. Cliquer sur **"+ New Variable"**
3. Ajouter UNE PAR UNE ces variables :

```
NODE_ENV
production

PORT
5000

ADMIN_EMAIL
arnaud.doguet@gmail.com

ADMIN_PASSWORD
VotreMotDePasseSecurise123!

JWT_SECRET
super_secret_jwt_changez_moi_123456789

MAX_PAGES_PER_CRAWL
10000

CRAWL_TIMEOUT
3600000

MAX_CONCURRENT_CRAWLS
3

FRONTEND_URL
https://audit-frontend.up.railway.app
```

**⚠️ IMPORTANT** : Pour `FRONTEND_URL`, mets une URL temporaire maintenant, on la changera après.

**🔑 Optionnel mais recommandé :** Ajouter une clé Google PageSpeed API
```
PAGESPEED_API_KEY
ta_cle_google_api
```

➡️ Comment obtenir une clé Google API (gratuit) :
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet
3. Activer "PageSpeed Insights API"
4. Créer une clé API
5. Copier/coller ici

### C. Configurer les Settings du Backend
1. Aller dans l'onglet **"Settings"**
2. Trouver la section **"Build"**
3. Vérifier :
   - **Build Command** : Laisser vide (Railway détecte automatiquement)
   - **Start Command** : `node backend/server.js`

4. Scroll vers le bas
5. Trouver **"Root Directory"**
6. Laisser vide (root du projet)

7. Cliquer **"Save Changes"** si nécessaire

### D. Lancer le déploiement
Railway démarre automatiquement le build. Tu peux voir les logs en temps réel.

Attendre ~2-3 minutes que le build se termine.

**✅ Backend déployé !**

---

## ÉTAPE 6 : Déployer le Frontend (3 min)

### A. Créer un nouveau service pour le Frontend
1. Dans ton projet Railway, cliquer **"+ New"**
2. Choisir **"GitHub Repo"**
3. Sélectionner à nouveau **"audit-mon-site"** (le même repo)
4. Railway crée un 2ème service

### B. Récupérer l'URL du Backend
1. Cliquer sur ton service **Backend** (le premier)
2. Aller dans l'onglet **"Settings"**
3. Trouver la section **"Domains"**
4. Tu verras une URL comme : `https://audit-mon-site-production-xxxx.up.railway.app`
5. **COPIER cette URL** (tu en auras besoin)

### C. Configurer le Frontend
1. Cliquer sur le **nouveau service** (le 2ème, celui qu'on vient de créer)
2. Aller dans **"Variables"**
3. Ajouter ces variables :

```
NODE_ENV
production

NEXT_PUBLIC_API_URL
https://ton-backend-url.up.railway.app
```

**⚠️ IMPORTANT** : Remplace `https://ton-backend-url.up.railway.app` par l'URL du backend que tu as copiée.

```
NEXT_PUBLIC_ADMIN_EMAIL
arnaud.doguet@gmail.com
```

### D. Configurer les Settings du Frontend
1. Aller dans **"Settings"**
2. Trouver **"Root Directory"**
3. Mettre : `frontend`

4. Trouver **"Build Command"**
5. Mettre : `npm install && npm run build`

6. Trouver **"Start Command"**
7. Mettre : `npm start`

8. Cliquer **"Save Changes"**

### E. Redéployer
1. Cliquer sur l'onglet **"Deployments"**
2. Cliquer sur les 3 petits points du dernier déploiement
3. Choisir **"Redeploy"**

Attendre ~3-5 minutes que le build se termine.

**✅ Frontend déployé !**

---

## ÉTAPE 7 : Finaliser la Configuration (1 min)

### A. Récupérer l'URL du Frontend
1. Cliquer sur ton service **Frontend**
2. Aller dans **"Settings"** → **"Domains"**
3. Tu verras une URL comme : `https://audit-mon-site-production-yyyy.up.railway.app`
4. **COPIER cette URL**

### B. Mettre à jour le Backend
1. Retourner sur le service **Backend**
2. Aller dans **"Variables"**
3. Modifier la variable `FRONTEND_URL`
4. Coller l'URL du frontend que tu viens de copier
5. Railway va automatiquement redéployer le backend

**✅ Configuration complète !**

---

## ÉTAPE 8 : TESTER ! 🎉

1. Ouvrir l'URL du **Frontend** dans ton navigateur
2. Tu devrais voir la page de login
3. Te connecter avec :
   - **Email** : `arnaud.doguet@gmail.com`
   - **Mot de passe** : celui que tu as mis dans `ADMIN_PASSWORD`

4. Cliquer sur **"Nouvel Audit"**
5. Entrer une URL : `https://example.com`
6. Cliquer **"Lancer l'audit"**
7. Attendre 2-10 minutes
8. **Télécharger le PowerPoint !**

**🎉 C'EST PRÊT !**

---

## 📊 Vérifier que tout fonctionne

### Logs Backend
1. Cliquer sur le service **Backend**
2. Aller dans **"Deployments"**
3. Cliquer sur le dernier déploiement
4. Tu devrais voir :
   ```
   ✅ Base de données initialisée
   🚀 Serveur démarré sur le port 5000
   📊 Environment: production
   ```

### Logs Frontend
1. Cliquer sur le service **Frontend**
2. Aller dans **"Deployments"**
3. Cliquer sur le dernier déploiement
4. Tu devrais voir :
   ```
   ✓ Ready in Xms
   ```

### Test de connexion
- Essayer de te connecter sur le frontend
- Si ça marche = TOUT EST BON ! ✅

---

## ❌ Dépannage si ça ne marche pas

### Erreur "Cannot connect to backend"
**Solution :**
1. Vérifie que `NEXT_PUBLIC_API_URL` dans le frontend contient bien l'URL du backend
2. Vérifie que `FRONTEND_URL` dans le backend contient bien l'URL du frontend
3. Redéploie les 2 services

### Erreur "Database connection failed"
**Solution :**
1. Vérifie que PostgreSQL est bien démarré dans Railway
2. Vérifie qu'il y a bien une variable `DATABASE_URL` (créée automatiquement)
3. Redémarre le backend

### Erreur 500 sur le backend
**Solution :**
1. Regarder les logs du backend
2. Vérifier que toutes les variables sont bien configurées
3. Vérifier que `START_COMMAND` est bien `node backend/server.js`

### Login ne fonctionne pas
**Solution :**
1. Vérifie `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans les variables backend
2. Essaie de redéployer le backend
3. Vide le cache du navigateur (Ctrl+Shift+R)

---

## 💰 Coûts Railway

**Premier mois :**
- 5$ de crédit gratuit inclus
- Probablement gratuit ou ~2-5$

**Après :**
- ~10-20$/mois selon utilisation
- Tu peux suivre la consommation dans Railway

---

## 🔒 Sécurité

**IMPORTANT** : Change le mot de passe admin !
1. Dans Railway, Backend → Variables
2. Modifier `ADMIN_PASSWORD`
3. Mettre un mot de passe FORT (12+ caractères)

---

## 🎯 URLs Importantes à Sauvegarder

Une fois déployé, sauvegarde ces URLs :

```
Frontend (interface) : https://ton-frontend.up.railway.app
Backend (API)        : https://ton-backend.up.railway.app
Email admin          : arnaud.doguet@gmail.com
Password admin       : [celui dans Railway]
```

---

## ✅ Checklist Finale

Avant de dire "c'est bon" :

- [ ] Backend déployé sans erreur
- [ ] Frontend déployé sans erreur
- [ ] PostgreSQL connecté
- [ ] Login fonctionne
- [ ] Peut créer un audit
- [ ] Audit se termine avec succès
- [ ] PowerPoint se télécharge
- [ ] Mot de passe admin changé

**SI TOUT EST COCHÉ = TU ES OPÉRATIONNEL ! 🚀**

---

## 🆘 Besoin d'Aide ?

**Si tu es bloqué :**
1. Vérifie les logs Railway
2. Vérifie toutes les variables d'environnement
3. Contacte-moi : arnaud.doguet@gmail.com

**Partage :**
- Capture d'écran de l'erreur
- Logs Railway (copier/coller)
- Quelle étape pose problème

---

## 🎉 Prochaines Étapes

Une fois que tout fonctionne :

### 1. Personnaliser
- Ajouter un domaine personnalisé dans Railway → Settings → Domains
- Modifier les couleurs dans `frontend/tailwind.config.js`

### 2. Utiliser
- Créer des audits pour tes clients
- Télécharger les rapports PowerPoint
- Analyser les sites

### 3. Upgrader vers V2 (quand prêt)
- Ajouter multi-utilisateurs
- Intégrer Stripe
- Monétiser !

---

**BON DÉPLOIEMENT ! 🚀**

**Tu peux le faire, c'est juste du copier/coller de variables ! 💪**
