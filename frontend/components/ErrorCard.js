import { useState, useEffect } from 'react';
import styles from '../styles/ErrorCard.module.css';

export default function ErrorCard({ issue, groupedIssues, onCheck }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkedPages, setCheckedPages] = useState({});
  const [groupChecked, setGroupChecked] = useState(false);

  useEffect(() => {
    // Charger les états depuis localStorage
    const saved = localStorage.getItem(`checklist_${issue.errorType || issue.title}`);
    if (saved) {
      const data = JSON.parse(saved);
      setCheckedPages(data.pages || {});
      setGroupChecked(data.groupChecked || false);
    }
  }, [issue]);

  const handleGroupCheck = () => {
    const newChecked = !groupChecked;
    setGroupChecked(newChecked);
    
    // Sauvegarder dans localStorage
    localStorage.setItem(`checklist_${issue.errorType || issue.title}`, JSON.stringify({
      groupChecked: newChecked,
      pages: checkedPages
    }));

    onCheck && onCheck(issue, newChecked);
  };

  const handlePageCheck = (url) => {
    const newCheckedPages = { ...checkedPages, [url]: !checkedPages[url] };
    setCheckedPages(newCheckedPages);
    
    // Sauvegarder dans localStorage
    localStorage.setItem(`checklist_${issue.errorType || issue.title}`, JSON.stringify({
      groupChecked,
      pages: newCheckedPages
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626'; // rouge
      case 'HIGH': return '#ea580c'; // orange
      case 'MEDIUM': return '#f59e0b'; // jaune/orange
      case 'LOW': return '#84cc16'; // vert/jaune
      default: return '#6b7280'; // gris
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'CRITIQUE';
      case 'HIGH': return 'ÉLEVÉ';
      case 'MEDIUM': return 'MOYEN';
      case 'LOW': return 'FAIBLE';
      default: return severity;
    }
  };

  const affectedCount = groupedIssues ? groupedIssues.length : 1;
  const checkedCount = Object.values(checkedPages).filter(Boolean).length;

  return (
    <div className={styles.card} style={{ borderLeftColor: getSeverityColor(issue.priority) }}>
      <div className={styles.header}>
        <input
          type="checkbox"
          checked={groupChecked}
          onChange={handleGroupCheck}
          className={styles.checkbox}
        />
        
        <div className={styles.headerContent}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{issue.title}</h3>
            <span className={styles.badge} style={{ backgroundColor: getSeverityColor(issue.priority) }}>
              {getSeverityLabel(issue.priority)}
            </span>
          </div>
          
          {groupedIssues && (
            <div className={styles.stats}>
              <span className={styles.count}>{affectedCount} page{affectedCount > 1 ? 's' : ''} concernée{affectedCount > 1 ? 's' : ''}</span>
              {checkedCount > 0 && (
                <span className={styles.progress}> · {checkedCount}/{affectedCount} corrigée{checkedCount > 1 ? 's' : ''}</span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.expandBtn}
          aria-label={isExpanded ? 'Réduire' : 'Développer'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          {issue.explanation && (
            <div className={styles.explanation}>
              <div className={styles.explanationSection}>
                <div className={styles.sectionIcon}>📖</div>
                <div>
                  <h4>C'est quoi ?</h4>
                  <p>{issue.explanation.description}</p>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <div className={styles.sectionIcon}>⚠️</div>
                <div>
                  <h4>Pourquoi c'est important ?</h4>
                  <p>{issue.explanation.why}</p>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <div className={styles.sectionIcon}>✅</div>
                <div>
                  <h4>Comment corriger ?</h4>
                  <p>{issue.explanation.how}</p>
                  {issue.explanation.example && (
                    <div className={styles.example}>
                      <strong>Exemple :</strong>
                      <code>{issue.explanation.example}</code>
                    </div>
                  )}
                </div>
              </div>

              {issue.explanation.impact && (
                <div className={styles.impact}>
                  <strong>Impact SEO :</strong> {issue.explanation.impact}
                </div>
              )}
            </div>
          )}

          {groupedIssues && groupedIssues.length > 0 && (
            <div className={styles.pages}>
              <h4 className={styles.pagesTitle}>📄 Pages concernées :</h4>
              <div className={styles.pagesList}>
                {groupedIssues.slice(0, isExpanded ? undefined : 5).map((pageIssue, idx) => (
                  <div key={idx} className={styles.pageItem}>
                    <input
                      type="checkbox"
                      checked={checkedPages[pageIssue.url] || false}
                      onChange={() => handlePageCheck(pageIssue.url)}
                      className={styles.pageCheckbox}
                    />
                    <a
                      href={pageIssue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.pageLink}
                    >
                      {pageIssue.url}
                    </a>
                    {pageIssue.description && (
                      <span className={styles.pageDesc}>· {pageIssue.description}</span>
                    )}
                  </div>
                ))}
                
                {!isExpanded && groupedIssues.length > 5 && (
                  <button 
                    onClick={() => setIsExpanded(true)} 
                    className={styles.showMoreBtn}
                  >
                    Voir les {groupedIssues.length - 5} autres...
                  </button>
                )}
              </div>
            </div>
          )}

          {!groupedIssues && (
            <div className={styles.singlePage}>
              <strong>Page concernée :</strong>
              <a href={issue.url} target="_blank" rel="noopener noreferrer" className={styles.pageLink}>
                {issue.url}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
