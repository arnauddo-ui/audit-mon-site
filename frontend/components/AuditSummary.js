import React from 'react';

export default function AuditSummary({ audit, stats }) {
  // Fonction pour compter les issues par type
  const countIssuesByType = (errorType) => {
    const allIssues = [
      ...(audit.results.issues.errors || []),
      ...(audit.results.issues.warnings || []),
      ...(audit.results.issues.opportunities || [])
    ];
    
    return allIssues.filter(issue => issue.errorType === errorType).length;
  };

  // Fonction pour compter les issues par titre exact
  const countIssuesByTitle = (title) => {
    const allIssues = [
      ...(audit.results.issues.errors || []),
      ...(audit.results.issues.warnings || []),
      ...(audit.results.issues.opportunities || [])
    ];
    
    return allIssues.filter(issue => issue.title === title).length;
  };

  // Fonction pour vérifier si un type d'issue existe
  const hasIssue = (errorType) => {
    return countIssuesByType(errorType) > 0;
  };

  const CheckItem = ({ label, count, isGood = false }) => {
    const icon = count === 0 || isGood ? '✅' : '❌';
    const color = count === 0 || isGood ? 'text-green-600' : 'text-red-600';
    const bgColor = count === 0 || isGood ? 'bg-green-50' : 'bg-red-50';
    
    return (
      <div className={`flex items-center justify-between p-3 ${bgColor} rounded-lg mb-2`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-sm font-bold ${color}`}>
          {count > 0 ? `${count} page${count > 1 ? 's' : ''}` : 'OK'}
        </span>
      </div>
    );
  };

  const SectionTitle = ({ icon, title }) => (
    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2 mt-6">
      <span className="text-2xl">{icon}</span>
      {title}
    </h3>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📊 Résumé de l'audit
        </h2>
        <p className="text-gray-600">
          Vue d'ensemble de toutes les vérifications effectuées sur {stats.pagesAnalyzed} pages
        </p>
      </div>

      {/* Codes HTTP */}
      <SectionTitle icon="🔍" title="Codes HTTP & Accessibilité" />
      <CheckItem label="Pages 404 (introuvables)" count={countIssuesByTitle('Erreur 404')} />
      <CheckItem label="Erreurs serveur (500/502/503)" count={countIssuesByTitle('Erreur serveur')} />
      <CheckItem label="Redirections (301/302)" count={countIssuesByTitle('Redirection')} />
      <CheckItem label="Codes HTTP inhabituels" count={countIssuesByTitle('Code HTTP inhabituel')} />

      {/* Meta Tags */}
      <SectionTitle icon="📄" title="Meta Tags" />
      <CheckItem label="Title manquant" count={countIssuesByType('missing_title')} />
      <CheckItem label="Title trop court (<30 caractères)" count={countIssuesByType('title_too_short')} />
      <CheckItem label="Title trop long (>60 caractères)" count={countIssuesByType('title_too_long')} />
      <CheckItem label="Title dupliqué" count={countIssuesByTitle('Title dupliqué')} />
      <CheckItem label="Meta description manquante" count={countIssuesByType('missing_meta_description')} />
      <CheckItem label="Meta description trop courte" count={countIssuesByType('meta_description_too_short')} />
      <CheckItem label="Meta description trop longue" count={countIssuesByType('meta_description_too_long')} />
      <CheckItem label="Meta description dupliquée" count={countIssuesByTitle('Meta description dupliquée')} />

      {/* Structure */}
      <SectionTitle icon="🏗️" title="Structure & Contenu" />
      <CheckItem label="H1 manquant" count={countIssuesByType('missing_h1')} />
      <CheckItem label="H1 multiples sur une page" count={countIssuesByType('multiple_h1')} />
      <CheckItem label="H1 dupliqué entre pages" count={countIssuesByTitle('H1 dupliqué')} />
      <CheckItem label="Images sans attribut alt" count={countIssuesByType('image_no_alt')} />
      <CheckItem label="Images sans dimensions" count={countIssuesByTitle('Image sans dimensions')} />

      {/* Liens */}
      <SectionTitle icon="🔗" title="Liens & Maillage Interne" />
      <CheckItem label="Canonical manquant" count={countIssuesByType('missing_canonical')} />
      <CheckItem label="Liens cassés (404)" count={countIssuesByType('broken_link')} />
      <CheckItem label="Pages orphelines" count={countIssuesByType('orphan_page')} />
      <CheckItem label="Profondeur excessive (>3 clics)" count={countIssuesByType('excessive_depth')} />
      <CheckItem label="Chaînes de redirections" count={countIssuesByType('redirect_chain')} />

      {/* Indexation */}
      <SectionTitle icon="🤖" title="Indexation & SEO Technique" />
      <CheckItem 
        label="Sitemap.xml" 
        count={countIssuesByType('sitemap_missing') + countIssuesByType('sitemap_incomplete')} 
      />
      <CheckItem label="Robots.txt" count={countIssuesByType('robots_txt_missing')} />
      <CheckItem label="HTTPS (sécurité)" count={countIssuesByTitle('Pas de HTTPS')} />
      <CheckItem label="Viewport mobile" count={countIssuesByTitle('Viewport manquant')} />
      <CheckItem label="Attribut lang" count={countIssuesByTitle('Attribut lang manquant')} />
      <CheckItem label="Schema markup" count={countIssuesByTitle('Pas de Schema markup')} />

      {/* International */}
      <SectionTitle icon="🌍" title="International & Multilingue" />
      <CheckItem label="Hreflang" count={countIssuesByType('hreflang_incomplete')} />
      <CheckItem label="Pagination (rel next/prev)" count={countIssuesByType('pagination_broken')} />

      {/* Performance */}
      <SectionTitle icon="⚡" title="Performance & Optimisation" />
      <CheckItem label="Images lazy loading" count={countIssuesByType('image_no_lazy_load')} />
      <CheckItem 
        label="AMP (Accelerated Mobile Pages)" 
        count={0} 
        isGood={countIssuesByType('amp_detected') > 0} 
      />

      {/* Score global */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Score global de l'audit</h3>
            <p className="text-sm text-gray-600">
              Basé sur l'analyse de {stats.pagesAnalyzed} pages
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-indigo-600">
              {audit.results.score || 0}<span className="text-2xl text-gray-400">/100</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalErrors} erreurs · {stats.totalWarnings} avertissements
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>✅ OK</strong> : Aucun problème détecté sur cet aspect · 
          <strong className="ml-2">❌ À corriger</strong> : Problèmes détectés nécessitant votre attention
        </p>
      </div>
    </div>
  );
}
