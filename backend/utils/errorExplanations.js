// Explications détaillées pour chaque type d'erreur SEO
const errorExplanations = {
  // ERREURS CRITIQUES
  'missing_h1': {
    title: 'H1 manquant',
    severity: 'CRITICAL',
    category: 'Structure',
    description: 'Le H1 est le titre principal de votre page. C\'est l\'élément le plus important pour indiquer le sujet à Google.',
    why: 'Google utilise le H1 pour comprendre de quoi parle la page. Sans H1, votre page perd en pertinence SEO.',
    how: 'Ajoutez une balise <h1> au début de votre contenu principal avec le titre de la page.',
    example: '<h1>Nettoyage de toiture dans l\'Ain - Tuile Net</h1>',
    impact: 'Très élevé - Perte de positionnement sur les mots-clés principaux'
  },

  'multiple_h1': {
    title: 'Plusieurs H1 sur la page',
    severity: 'CRITICAL',
    category: 'Structure',
    description: 'Chaque page ne doit avoir qu\'UN SEUL H1. Plusieurs H1 créent de la confusion pour Google.',
    why: 'Google ne sait plus quel est le sujet principal de la page.',
    how: 'Gardez seulement le H1 principal et transformez les autres en H2 ou H3.',
    example: 'Gardez <h1>Titre principal</h1> et remplacez les autres par <h2>Sous-titre</h2>',
    impact: 'Élevé - Dilution du sujet principal'
  },

  'missing_title': {
    title: 'Title manquant',
    severity: 'CRITICAL',
    category: 'Meta tags',
    description: 'Le title est le titre qui apparaît dans les résultats Google. Sans title, Google en génère un aléatoire.',
    why: 'Le title est l\'élément le plus important pour le SEO. Il apparaît dans les résultats de recherche.',
    how: 'Ajoutez une balise <title> dans le <head> de votre page.',
    example: '<title>Nettoyage toiture Ain | Devis gratuit | Tuile Net</title>',
    impact: 'Critique - La page n\'apparaîtra pas correctement dans Google'
  },

  'no_https': {
    title: 'Site non sécurisé (pas de HTTPS)',
    severity: 'CRITICAL',
    category: 'Sécurité',
    description: 'Votre site utilise HTTP au lieu de HTTPS. Google pénalise les sites non sécurisés.',
    why: 'HTTPS est un facteur de classement Google. Les navigateurs affichent "Non sécurisé".',
    how: 'Installez un certificat SSL (gratuit avec Let\'s Encrypt) et redirigez tout le trafic vers HTTPS.',
    example: 'https://votresite.com au lieu de http://votresite.com',
    impact: 'Critique - Pénalisation Google + perte de confiance utilisateurs'
  },

  // ERREURS IMPORTANTES
  'title_too_short': {
    title: 'Title trop court',
    severity: 'HIGH',
    category: 'Meta tags',
    description: 'Votre title fait moins de 30 caractères. Il n\'est pas assez descriptif.',
    why: 'Un title court ne capte pas l\'attention et manque de mots-clés.',
    how: 'Allongez le title à 50-60 caractères avec vos mots-clés principaux.',
    example: 'Au lieu de "Accueil", utilisez "Nettoyage toiture Ain | Devis gratuit | Tuile Net"',
    impact: 'Élevé - Faible taux de clic dans Google'
  },

  'title_too_long': {
    title: 'Title trop long',
    severity: 'HIGH',
    category: 'Meta tags',
    description: 'Votre title dépasse 60 caractères. Il sera coupé dans Google (...).',
    why: 'Google affiche seulement 50-60 caractères. Le reste est tronqué.',
    how: 'Réduisez le title à maximum 60 caractères en gardant l\'essentiel.',
    example: 'Réduisez de 82 à 58 caractères max',
    impact: 'Moyen - Message tronqué dans les résultats'
  },

  'missing_meta_description': {
    title: 'Meta description manquante',
    severity: 'HIGH',
    category: 'Meta tags',
    description: 'La meta description est le texte qui apparaît sous le title dans Google. Sans elle, Google génère un extrait aléatoire.',
    why: 'La meta description incite au clic. Une bonne description augmente le taux de clic de 30%.',
    how: 'Ajoutez une meta description de 120-160 caractères avec un appel à l\'action.',
    example: '<meta name="description" content="Nettoyage de toiture dans l\'Ain. Devis gratuit en 24h. 15 ans d\'expérience. Appelez le 04 XX XX XX XX">',
    impact: 'Élevé - Perte de clics potentiels'
  },

  'meta_description_too_short': {
    title: 'Meta description trop courte',
    severity: 'MEDIUM',
    category: 'Meta tags',
    description: 'Votre meta description fait moins de 120 caractères. Elle n\'est pas assez descriptive.',
    why: 'Une description courte ne donne pas assez d\'informations pour inciter au clic.',
    how: 'Allongez à 120-160 caractères en ajoutant des bénéfices et un appel à l\'action.',
    example: 'Passez de 80 à 140 caractères en ajoutant vos avantages',
    impact: 'Moyen - Taux de clic sous-optimal'
  },

  'meta_description_too_long': {
    title: 'Meta description trop longue',
    severity: 'MEDIUM',
    category: 'Meta tags',
    description: 'Votre meta description dépasse 160 caractères. Elle sera coupée dans Google.',
    why: 'Google affiche seulement 120-160 caractères selon l\'écran.',
    how: 'Réduisez à maximum 160 caractères en gardant l\'essentiel au début.',
    example: 'Mettez les infos importantes dans les 120 premiers caractères',
    impact: 'Moyen - Message tronqué'
  },

  'h1_too_long': {
    title: 'H1 trop long',
    severity: 'MEDIUM',
    category: 'Structure',
    description: 'Votre H1 dépasse 70 caractères. Il est trop long et dilue le message.',
    why: 'Un H1 long perd en impact et est moins clair pour Google.',
    how: 'Réduisez à maximum 70 caractères en gardant l\'essentiel.',
    example: 'Au lieu de "Entreprise de nettoyage et démoussage de toiture dans l\'Ain", utilisez "Nettoyage de toiture dans l\'Ain"',
    impact: 'Moyen - Dilution du message'
  },

  'missing_h2': {
    title: 'Pas de H2 sur la page',
    severity: 'MEDIUM',
    category: 'Structure',
    description: 'Votre page a du contenu (>300 mots) mais aucun H2. La structure est pauvre.',
    why: 'Les H2 structurent le contenu et aident Google à comprendre les sous-thèmes.',
    how: 'Divisez votre contenu en sections avec des H2.',
    example: '<h2>Nos services de nettoyage</h2>, <h2>Nos tarifs</h2>, <h2>Zone d\'intervention</h2>',
    impact: 'Moyen - Lisibilité et SEO sous-optimaux'
  },

  // IMAGES
  'missing_alt': {
    title: 'Attribut alt manquant',
    severity: 'HIGH',
    category: 'Images',
    description: 'Vos images n\'ont pas d\'attribut alt. Google ne sait pas ce qu\'elles représentent.',
    why: 'L\'alt permet à Google de comprendre l\'image et améliore l\'accessibilité.',
    how: 'Ajoutez un attribut alt descriptif à chaque image.',
    example: '<img src="toiture.jpg" alt="Toiture avant nettoyage - Tuile Net Ain">',
    impact: 'Élevé - Perte de trafic Google Images + accessibilité'
  },

  'empty_alt': {
    title: 'Attribut alt vide',
    severity: 'MEDIUM',
    category: 'Images',
    description: 'L\'attribut alt existe mais est vide (alt=""). Google ne comprend pas l\'image.',
    why: 'Un alt vide = image invisible pour Google.',
    how: 'Remplissez l\'alt avec une description de l\'image.',
    example: 'alt="Couvreur nettoyant une toiture"',
    impact: 'Moyen - Image invisible pour Google'
  },

  'alt_too_long': {
    title: 'Attribut alt trop long',
    severity: 'LOW',
    category: 'Images',
    description: 'L\'alt dépasse 125 caractères. Il est trop verbeux.',
    why: 'Un alt trop long est considéré comme du spam.',
    how: 'Réduisez à maximum 125 caractères.',
    example: 'Au lieu de "Photo d\'un couvreur professionnel en train de nettoyer...", utilisez "Nettoyage de toiture par Tuile Net"',
    impact: 'Faible - Sur-optimisation'
  },

  'image_no_lazy_load': {
    title: 'Image non lazy-loadée',
    severity: 'LOW',
    category: 'Performance',
    description: 'Les images après la 2ème ne sont pas en lazy loading. Cela ralentit le chargement.',
    why: 'Le lazy loading charge les images seulement quand l\'utilisateur scroll.',
    how: 'Ajoutez loading="lazy" aux images hors du viewport initial.',
    example: '<img src="image.jpg" loading="lazy" alt="Description">',
    impact: 'Faible - Vitesse de chargement'
  },

  // CONTENU
  'thin_content': {
    title: 'Contenu trop faible',
    severity: 'HIGH',
    category: 'Contenu',
    description: 'Votre page contient moins de 300 mots. C\'est insuffisant pour bien se positionner.',
    why: 'Google favorise les contenus complets et détaillés (>500 mots).',
    how: 'Ajoutez du contenu pertinent : détails services, avantages, FAQ, etc.',
    example: 'Passez de 180 à 500+ mots en détaillant vos services',
    impact: 'Élevé - Difficulté à se positionner'
  },

  'very_thin_content': {
    title: 'Contenu très faible',
    severity: 'CRITICAL',
    category: 'Contenu',
    description: 'Votre page contient moins de 50 mots. C\'est une page quasi-vide.',
    why: 'Google considère ces pages comme "thin content" et les pénalise.',
    how: 'Ajoutez au minimum 300 mots de contenu pertinent ou supprimez la page.',
    example: 'Développez le sujet ou redirigez vers une autre page',
    impact: 'Critique - Pénalisation Google'
  },

  // TECHNIQUE
  'missing_viewport': {
    title: 'Balise viewport manquante',
    severity: 'CRITICAL',
    category: 'Mobile',
    description: 'La balise viewport est absente. Votre site n\'est pas responsive.',
    why: 'Google privilégie le mobile-first. Sans viewport, votre site est illisible sur mobile.',
    how: 'Ajoutez la balise viewport dans le <head>.',
    example: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    impact: 'Critique - Site non responsive + pénalisation mobile'
  },

  'missing_canonical': {
    title: 'Balise canonical manquante',
    severity: 'MEDIUM',
    category: 'Technique',
    description: 'La balise canonical indique à Google quelle est la version principale de la page.',
    why: 'Évite les problèmes de contenu dupliqué si votre page est accessible via plusieurs URLs.',
    how: 'Ajoutez une balise canonical pointant vers l\'URL principale.',
    example: '<link rel="canonical" href="https://votresite.com/page">',
    impact: 'Moyen - Risque de duplication'
  },

  'broken_link': {
    title: 'Lien cassé (404)',
    severity: 'HIGH',
    category: 'Liens',
    description: 'Cette page contient des liens qui pointent vers des pages inexistantes (404).',
    why: 'Les liens cassés nuisent à l\'expérience utilisateur et au SEO.',
    how: 'Réparez ou supprimez les liens cassés.',
    example: 'Vérifiez et corrigez chaque lien en erreur 404',
    impact: 'Élevé - Mauvaise expérience utilisateur'
  },

  // OPPORTUNITÉS
  'missing_schema': {
    title: 'Pas de données structurées',
    severity: 'LOW',
    category: 'Opportunité',
    description: 'Votre site n\'utilise pas de schema markup (JSON-LD). Vous manquez des opportunités de rich snippets.',
    why: 'Le schema markup permet d\'afficher des informations enrichies dans Google (étoiles, prix, horaires...).',
    how: 'Ajoutez du schema markup adapté à votre activité (LocalBusiness, Service, etc.).',
    example: 'Ajoutez un schema LocalBusiness avec vos coordonnées et avis',
    impact: 'Opportunité - Meilleure visibilité dans Google'
  },

  'missing_og': {
    title: 'Open Graph incomplet',
    severity: 'LOW',
    category: 'Social',
    description: 'Les balises Open Graph (Facebook) sont absentes ou incomplètes.',
    why: 'Les balises OG contrôlent comment votre page apparaît sur Facebook, LinkedIn, etc.',
    how: 'Ajoutez og:title, og:description, og:image, og:url.',
    example: '<meta property="og:title" content="Nettoyage toiture Ain">',
    impact: 'Opportunité - Meilleur partage sur réseaux sociaux'
  },

  'duplicate_title': {
    title: 'Title dupliqué',
    severity: 'HIGH',
    category: 'Duplication',
    description: 'Plusieurs pages ont exactement le même title. Google ne sait plus quelle page afficher.',
    why: 'Les titles dupliqués créent de la concurrence interne entre vos propres pages.',
    how: 'Rendez chaque title unique en ajoutant le contexte de la page.',
    example: 'Au lieu de "Services" partout, utilisez "Nettoyage toiture", "Démoussage", etc.',
    impact: 'Élevé - Cannibalisation SEO'
  },

  'duplicate_meta_description': {
    title: 'Meta description dupliquée',
    severity: 'MEDIUM',
    category: 'Duplication',
    description: 'Plusieurs pages ont la même meta description.',
    why: 'Les descriptions dupliquées réduisent le taux de clic et la pertinence.',
    how: 'Écrivez une description unique pour chaque page.',
    example: 'Adaptez la description au contenu spécifique de chaque page',
    impact: 'Moyen - Perte de clics'
  },

  'duplicate_h1': {
    title: 'H1 dupliqué',
    severity: 'MEDIUM',
    category: 'Duplication',
    description: 'Plusieurs pages ont le même H1.',
    why: 'Les H1 dupliqués créent de la confusion pour Google.',
    how: 'Rendez chaque H1 unique et spécifique à la page.',
    example: 'Variez les H1 selon le contexte de chaque page',
    impact: 'Moyen - Confusion thématique'
  },

  // === NOUVELLES ERREURS V2.0 ===

  'broken_link': {
    title: 'Lien cassé (404)',
    severity: 'HIGH',
    category: 'Maillage interne',
    description: 'Cette page contient un lien vers une page qui n\'existe pas (erreur 404).',
    why: 'Les liens cassés nuisent à l\'expérience utilisateur et au crawl de Google.',
    how: 'Corrigez le lien pour qu\'il pointe vers une page valide, ou supprimez-le.',
    example: 'Remplacez le lien cassé ou créez une redirection 301',
    impact: 'Élevé - Perte d\'autorité + mauvaise expérience utilisateur'
  },

  'orphan_page': {
    title: 'Page orpheline',
    severity: 'HIGH',
    category: 'Maillage interne',
    description: 'Cette page n\'a aucun lien interne qui pointe vers elle. Elle est isolée du reste du site.',
    why: 'Google aura du mal à découvrir et indexer cette page. Elle ne reçoit pas de "jus SEO".',
    how: 'Ajoutez des liens depuis d\'autres pages pertinentes de votre site vers cette page.',
    example: 'Ajoutez un lien dans le menu, le footer, ou depuis un article connexe',
    impact: 'Élevé - Page invisible pour Google'
  },

  'redirect_chain': {
    title: 'Chaîne de redirections',
    severity: 'HIGH',
    category: 'Technique',
    description: 'Cette URL passe par plusieurs redirections (301 → 301 → 301) avant d\'arriver à la page finale.',
    why: 'Les chaînes de redirections ralentissent le chargement et diluent le "jus SEO".',
    how: 'Faites rediriger directement vers la page finale, sans étapes intermédiaires.',
    example: 'Au lieu de A→B→C, faites A→C et B→C directement',
    impact: 'Élevé - Perte de vitesse + dilution du SEO'
  },

  'sitemap_missing': {
    title: 'Sitemap.xml manquant',
    severity: 'HIGH',
    category: 'Indexation',
    description: 'Votre site n\'a pas de fichier sitemap.xml.',
    why: 'Le sitemap aide Google à découvrir toutes vos pages. Sans lui, certaines pages peuvent ne pas être indexées.',
    how: 'Créez un sitemap.xml avec toutes vos URLs et soumettez-le dans Google Search Console.',
    example: 'Utilisez un plugin (Yoast, RankMath) ou générateur en ligne',
    impact: 'Élevé - Pages non indexées par Google'
  },

  'sitemap_incomplete': {
    title: 'Sitemap incomplet',
    severity: 'MEDIUM',
    category: 'Indexation',
    description: 'Votre sitemap.xml contient moins d\'URLs que de pages découvertes sur votre site.',
    why: 'Des pages manquent dans le sitemap. Google pourrait ne pas les découvrir.',
    how: 'Mettez à jour votre sitemap pour inclure TOUTES les pages publiques de votre site.',
    example: 'Régénérez votre sitemap avec un plugin ou outil automatique',
    impact: 'Moyen - Certaines pages peuvent ne pas être indexées'
  },

  'robots_txt_missing': {
    title: 'Robots.txt manquant',
    severity: 'MEDIUM',
    category: 'Indexation',
    description: 'Votre site n\'a pas de fichier robots.txt.',
    why: 'Le robots.txt guide les robots Google. Sans lui, vous n\'avez aucun contrôle sur ce qui est crawlé.',
    how: 'Créez un fichier robots.txt à la racine de votre site avec les directives basiques.',
    example: 'User-agent: *\\nAllow: /\\nSitemap: https://votresite.com/sitemap.xml',
    impact: 'Moyen - Perte de contrôle sur le crawl'
  },

  'excessive_depth': {
    title: 'Profondeur excessive',
    severity: 'MEDIUM',
    category: 'Architecture',
    description: 'Cette page est trop loin de la homepage (plus de 3 clics).',
    why: 'Plus une page est profonde, moins elle reçoit de "jus SEO" et moins Google la crawle.',
    how: 'Ajoutez des liens depuis des pages plus proches de la homepage (menu, catégories).',
    example: 'Ajoutez cette page dans le menu principal ou créez une page catégorie',
    impact: 'Moyen - Page moins crawlée et moins puissante'
  },

  'hreflang_incomplete': {
    title: 'Hreflang incomplet',
    severity: 'MEDIUM',
    category: 'International',
    description: 'Certaines pages ont hreflang mais pas toutes.',
    why: 'Si vous utilisez hreflang, TOUTES les pages équivalentes doivent en avoir.',
    how: 'Ajoutez hreflang sur toutes les versions linguistiques de vos pages.',
    example: '<link rel="alternate" hreflang="fr" href="https://site.fr/page" />',
    impact: 'Moyen - Confusion dans les résultats internationaux'
  },

  'pagination_broken': {
    title: 'Pagination cassée',
    severity: 'MEDIUM',
    category: 'Pagination',
    description: 'Les balises rel="next" ou rel="prev" pointent vers des pages qui n\'existent pas.',
    why: 'La pagination cassée empêche Google de comprendre la structure de vos pages paginées.',
    how: 'Corrigez les liens de pagination pour qu\'ils pointent vers des pages valides.',
    example: 'Vérifiez que toutes les pages de la série de pagination existent',
    impact: 'Moyen - Mauvaise indexation des pages paginées'
  },

  'amp_detected': {
    title: 'AMP détecté',
    severity: 'LOW',
    category: 'Performance',
    description: 'Votre site utilise AMP (Accelerated Mobile Pages).',
    why: 'AMP peut améliorer la vitesse mobile, mais nécessite une maintenance supplémentaire.',
    how: 'Vérifiez que vos pages AMP sont correctement configurées et validées.',
    example: 'Testez vos URLs AMP avec l\'outil de validation Google',
    impact: 'Faible - Opportunité d\'optimisation mobile'
  }
};

module.exports = errorExplanations;
