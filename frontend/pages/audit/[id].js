import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/AuditDetail.module.css';
import ErrorCard from '../../components/ErrorCard';
import AuditSummary from '../../components/AuditSummary';

export default function AuditDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour l'interface
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'errors', 'warnings', 'opportunities'
  const [viewMode, setViewMode] = useState('byType'); // 'byType', 'byPage'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all'); // 'all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  const [errorTypeFilter, setErrorTypeFilter] = useState(null); // Filtre par errorType depuis le résumé
  
  useEffect(() => {
    if (id) {
      fetchAudit();
    }
  }, [id]);

  const fetchAudit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/audits/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Audit non trouvé');
      const data = await response.json();
      
      // Transformer les données du backend vers le format attendu
      const transformedData = {
        ...data,
        results: {
          score: data.score || 0,
          stats: {
            pagesAnalyzed: data.total_pages || 0,
            totalErrors: data.total_errors || 0,
            totalWarnings: data.total_warnings || 0,
            totalOpportunities: data.total_opportunities || 0
          },
          issues: (() => {
            // Parser les issues selon leur format
            if (!data.issues) return { errors: [], warnings: [], opportunities: [] };
            if (typeof data.issues === 'string') {
              try {
                return JSON.parse(data.issues);
              } catch (e) {
                return { errors: [], warnings: [], opportunities: [] };
              }
            }
            return data.issues;
          })(),
          pagesAnalyzed: data.total_pages || 0
        }
      };
      
      setAudit(transformedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/audits/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_${id}.pptx`;
      a.click();
    } catch (err) {
      alert('Erreur lors du téléchargement');
    }
  };

  // Naviguer depuis le résumé vers un onglet avec filtre
  const handleNavigateFromSummary = (tab, errorType) => {
    setActiveTab(tab);
    setErrorTypeFilter(errorType);
    setSearchTerm('');
    setSelectedPriority('all');
  };

  // Grouper les issues par type d'erreur
  const groupIssuesByType = (issues) => {
    const grouped = {};
    issues.forEach(issue => {
      const key = issue.errorType || issue.title;
      if (!grouped[key]) {
        grouped[key] = {
          ...issue,
          issues: []
        };
      }
      grouped[key].issues.push(issue);
    });
    return Object.values(grouped);
  };

  // Grouper les issues par page
  const groupIssuesByPage = (issues) => {
    const grouped = {};
    issues.forEach(issue => {
      if (!grouped[issue.url]) {
        grouped[issue.url] = [];
      }
      grouped[issue.url].push(issue);
    });
    return grouped;
  };

  // Filtrer les issues
  const filterIssues = (issues) => {
    let filtered = issues;

    // Filtre par errorType (depuis le résumé)
    if (errorTypeFilter) {
      filtered = filtered.filter(i => i.errorType === errorTypeFilter || i.title === errorTypeFilter);
    }

    // Filtre par priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(i => i.priority === selectedPriority);
    }

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.title?.toLowerCase().includes(term) ||
        i.url?.toLowerCase().includes(term) ||
        i.description?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  // Calculer la progression
  const calculateProgress = (issues) => {
    let totalChecked = 0;
    let total = 0;

    issues.forEach(issue => {
      const key = issue.errorType || issue.title;
      const saved = localStorage.getItem(`checklist_${key}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.groupChecked) totalChecked++;
      }
      total++;
    });

    return { totalChecked, total, percentage: total > 0 ? Math.round((totalChecked / total) * 100) : 0 };
  };

  // Calculer les stats de manière rétrocompatible (pour les anciens audits)
  const getStats = (audit) => {
    // Si les stats existent déjà (nouveau format), les utiliser
    if (audit?.results?.stats) {
      return audit.results.stats;
    }
    
    // Sinon, calculer à partir des données disponibles (ancien format)
    const errors = audit?.results?.issues?.errors || [];
    const warnings = audit?.results?.issues?.warnings || [];
    const opportunities = audit?.results?.issues?.opportunities || [];
    
    return {
      pagesAnalyzed: audit?.results?.pagesAnalyzed || 0,
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      totalOpportunities: opportunities.length
    };
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Chargement de l'audit...</p>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className={styles.error}>
        <h1>❌ Erreur</h1>
        <p>{error || 'Audit introuvable'}</p>
        <Link href="/dashboard">
          <a className={styles.backBtn}>← Retour au tableau de bord</a>
        </Link>
      </div>
    );
  }

  // Si l'audit est en cours (pending), afficher un message d'attente
  if (audit.status === 'pending' || !audit.results) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <h1>⏳ Audit en cours...</h1>
        <p>L'analyse de <strong>{audit.url}</strong> est en cours.</p>
        <p>Cela peut prendre 2-5 minutes selon la taille du site.</p>
        <Link href="/dashboard">
          <a className={styles.backBtn}>← Retour au tableau de bord</a>
        </Link>
      </div>
    );
  }

  const currentIssues = audit.results.issues[activeTab] || [];
  const filteredIssues = filterIssues(currentIssues);
  const progress = calculateProgress(filteredIssues);
  const stats = getStats(audit); // Calcul rétrocompatible des stats

  return (
    <>
      <Head>
        <title>Audit de {audit.url} | Audit Mon Site</title>
      </Head>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <Link href="/dashboard">
              <a className={styles.backLink}>← Tableau de bord</a>
            </Link>
            <h1 className={styles.pageTitle}>Audit SEO</h1>
            <p className={styles.url}>{audit.url}</p>
          </div>
          
          <button onClick={downloadReport} className={styles.downloadBtn}>
            📥 Télécharger le rapport PowerPoint
          </button>
        </div>

        {/* Score global */}
        <div className={styles.scoreCard}>
          <div className={styles.scoreCircle}>
            <div 
              className={styles.scoreValue} 
              style={{ color: audit.results.score >= 70 ? '#10b981' : audit.results.score >= 40 ? '#f59e0b' : '#dc2626' }}
            >
              {audit.results.score}
            </div>
            <div className={styles.scoreLabel}>sur 100</div>
          </div>

          <div className={styles.scoreStats}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Pages analysées</div>
              <div className={styles.statValue}>{stats.pagesAnalyzed}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Erreurs</div>
              <div className={styles.statValue} style={{ color: '#dc2626' }}>
                {stats.totalErrors}
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Avertissements</div>
              <div className={styles.statValue} style={{ color: '#f59e0b' }}>
                {stats.totalWarnings}
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Opportunités</div>
              <div className={styles.statValue} style={{ color: '#3b82f6' }}>
                {stats.totalOpportunities}
              </div>
            </div>
          </div>
        </div>

        {/* Progression */}
        {progress.total > 0 && (
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.progressTitle}>📊 Votre progression</span>
              <span className={styles.progressStats}>{progress.totalChecked}/{progress.total} ({progress.percentage}%)</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'summary' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('summary');
              setErrorTypeFilter(null);
            }}
          >
            📊 Résumé
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'errors' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('errors');
              setErrorTypeFilter(null);
            }}
          >
            ❌ Erreurs ({audit.results.issues.errors?.length || 0})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'warnings' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('warnings');
              setErrorTypeFilter(null);
            }}
          >
            ⚠️ Avertissements ({audit.results.issues.warnings?.length || 0})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'opportunities' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('opportunities');
              setErrorTypeFilter(null);
            }}
          >
            💡 Opportunités ({audit.results.issues.opportunities?.length || 0})
          </button>
        </div>

        {/* Badge filtre actif */}
        {errorTypeFilter && activeTab !== 'summary' && (
          <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#1e40af' }}>
                🔍 <strong>Filtre actif :</strong> {errorTypeFilter.replace(/_/g, ' ')}
              </span>
              <button 
                onClick={() => setErrorTypeFilter(null)}
                style={{ 
                  padding: '4px 12px', 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✕ Réinitialiser
              </button>
            </div>
          </div>
        )}

        {/* Contrôles */}
        {activeTab !== 'summary' && (
          <div className={styles.controls}>
            <div className={styles.viewModeToggle}>
              <button
                className={`${styles.viewBtn} ${viewMode === 'byType' ? styles.activeViewBtn : ''}`}
                onClick={() => setViewMode('byType')}
              >
                Par type d'erreur
              </button>
              <button
                className={`${styles.viewBtn} ${viewMode === 'byPage' ? styles.activeViewBtn : ''}`}
                onClick={() => setViewMode('byPage')}
              >
                Par page
              </button>
            </div>

            <div className={styles.filters}>
              <select 
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className={styles.priorityFilter}
              >
                <option value="all">Toutes les priorités</option>
                <option value="CRITICAL">Critique uniquement</option>
                <option value="HIGH">Élevé uniquement</option>
                <option value="MEDIUM">Moyen uniquement</option>
                <option value="LOW">Faible uniquement</option>
              </select>

              <input
                type="text"
                placeholder="🔍 Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        )}

        {/* Contenu */}
        <div className={styles.content}>
          {activeTab === 'summary' ? (
            <AuditSummary audit={audit} stats={stats} onNavigate={handleNavigateFromSummary} />
          ) : filteredIssues.length === 0 ? (
            <div className={styles.emptyState}>
              <p>🎉 Aucun problème trouvé dans cette catégorie !</p>
            </div>
          ) : (
            <>
              {viewMode === 'byType' ? (
                <div className={styles.issuesList}>
                  {groupIssuesByType(filteredIssues).map((group, idx) => (
                    <ErrorCard
                      key={idx}
                      issue={group}
                      groupedIssues={group.issues}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.byPageView}>
                  {Object.entries(groupIssuesByPage(filteredIssues)).map(([url, issues]) => (
                    <div key={url} className={styles.pageGroup}>
                      <h3 className={styles.pageGroupTitle}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {url}
                        </a>
                        <span className={styles.pageGroupCount}>
                          {issues.length} problème{issues.length > 1 ? 's' : ''}
                        </span>
                      </h3>
                      <div className={styles.pageGroupIssues}>
                        {issues.map((issue, idx) => (
                          <ErrorCard
                            key={idx}
                            issue={issue}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
