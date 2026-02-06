const axios = require('axios');

class PageSpeedService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.PAGESPEED_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  }

  async analyze(url, strategy = 'mobile') {
    try {
      const params = {
        url: url,
        strategy: strategy, // 'mobile' ou 'desktop'
        category: ['performance', 'accessibility', 'best-practices', 'seo'],
      };
      
      if (this.apiKey) {
        params.key = this.apiKey;
      }
      
      const response = await axios.get(this.baseUrl, { params });
      const data = response.data;
      
      return this.parseResults(data);
      
    } catch (error) {
      console.error('Erreur PageSpeed API:', error.message);
      return null;
    }
  }

  parseResults(data) {
    const lighthouseResult = data.lighthouseResult;
    const loadingExperience = data.loadingExperience;
    
    // Core Web Vitals
    const metrics = lighthouseResult.audits;
    
    const result = {
      // Scores de catégories
      performanceScore: Math.round(lighthouseResult.categories.performance.score * 100),
      accessibilityScore: Math.round(lighthouseResult.categories.accessibility.score * 100),
      bestPracticesScore: Math.round(lighthouseResult.categories['best-practices'].score * 100),
      seoScore: Math.round(lighthouseResult.categories.seo.score * 100),
      
      // Core Web Vitals
      metrics: {
        // LCP - Largest Contentful Paint
        lcp: {
          value: metrics['largest-contentful-paint']?.numericValue || 0,
          displayValue: metrics['largest-contentful-paint']?.displayValue || 'N/A',
          score: metrics['largest-contentful-paint']?.score || 0,
          rating: this.getLCPRating(metrics['largest-contentful-paint']?.numericValue)
        },
        
        // FID - First Input Delay (ou TBT - Total Blocking Time en lab)
        fid: {
          value: metrics['total-blocking-time']?.numericValue || 0,
          displayValue: metrics['total-blocking-time']?.displayValue || 'N/A',
          score: metrics['total-blocking-time']?.score || 0,
          rating: this.getTBTRating(metrics['total-blocking-time']?.numericValue)
        },
        
        // CLS - Cumulative Layout Shift
        cls: {
          value: metrics['cumulative-layout-shift']?.numericValue || 0,
          displayValue: metrics['cumulative-layout-shift']?.displayValue || 'N/A',
          score: metrics['cumulative-layout-shift']?.score || 0,
          rating: this.getCLSRating(metrics['cumulative-layout-shift']?.numericValue)
        },
        
        // FCP - First Contentful Paint
        fcp: {
          value: metrics['first-contentful-paint']?.numericValue || 0,
          displayValue: metrics['first-contentful-paint']?.displayValue || 'N/A',
          score: metrics['first-contentful-paint']?.score || 0
        },
        
        // TTFB - Time to First Byte
        ttfb: {
          value: metrics['server-response-time']?.numericValue || 0,
          displayValue: metrics['server-response-time']?.displayValue || 'N/A',
          score: metrics['server-response-time']?.score || 0
        },
        
        // Speed Index
        speedIndex: {
          value: metrics['speed-index']?.numericValue || 0,
          displayValue: metrics['speed-index']?.displayValue || 'N/A',
          score: metrics['speed-index']?.score || 0
        }
      },
      
      // Opportunités d'amélioration
      opportunities: this.extractOpportunities(lighthouseResult.audits),
      
      // Diagnostics
      diagnostics: this.extractDiagnostics(lighthouseResult.audits),
    };
    
    return result;
  }

  getLCPRating(value) {
    if (!value) return 'unknown';
    const seconds = value / 1000;
    if (seconds <= 2.5) return 'good';
    if (seconds <= 4.0) return 'needs-improvement';
    return 'poor';
  }

  getTBTRating(value) {
    if (!value) return 'unknown';
    if (value <= 200) return 'good';
    if (value <= 600) return 'needs-improvement';
    return 'poor';
  }

  getCLSRating(value) {
    if (!value && value !== 0) return 'unknown';
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  extractOpportunities(audits) {
    const opportunities = [];
    
    Object.keys(audits).forEach(key => {
      const audit = audits[key];
      if (audit.details && audit.details.type === 'opportunity' && audit.score < 1) {
        opportunities.push({
          id: key,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          displayValue: audit.displayValue,
          savings: audit.details.overallSavingsMs || 0
        });
      }
    });
    
    // Trier par économies potentielles
    return opportunities.sort((a, b) => b.savings - a.savings).slice(0, 10);
  }

  extractDiagnostics(audits) {
    const diagnostics = [];
    
    const diagnosticKeys = [
      'uses-responsive-images',
      'offscreen-images',
      'unminified-css',
      'unminified-javascript',
      'unused-css-rules',
      'unused-javascript',
      'uses-optimized-images',
      'modern-image-formats',
      'uses-text-compression',
      'uses-rel-preconnect',
      'uses-http2',
      'font-display',
      'dom-size'
    ];
    
    diagnosticKeys.forEach(key => {
      if (audits[key] && audits[key].score < 1) {
        diagnostics.push({
          id: key,
          title: audits[key].title,
          description: audits[key].description,
          score: audits[key].score,
          displayValue: audits[key].displayValue
        });
      }
    });
    
    return diagnostics;
  }
}

module.exports = PageSpeedService;
