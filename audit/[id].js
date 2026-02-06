import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import axios from 'axios'
import Link from 'next/link'

export default function AuditResult() {
  const router = useRouter()
  const { id } = router.query
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    loadAudit(token)
    
    // Poll toutes les 5 secondes si l'audit est en cours
    const interval = setInterval(() => {
      if (audit?.status === 'pending') {
        loadAudit(token, false)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [id, audit?.status])

  const loadAudit = async (token, showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/audit/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setAudit(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de chargement')
      if (err.response?.status === 401) {
        router.push('/')
      }
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const downloadPPT = () => {
    if (!audit?.ppt_path) return
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    window.open(`${apiUrl}${audit.ppt_path}`, '_blank')
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Chargement de l'audit...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/dashboard">
            <button className="btn btn-primary">Retour au dashboard</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Audit #{id} - Audit Mon Site</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary">Résultats de l'Audit</h1>
                <p className="text-sm text-gray-600 mt-1">{audit.url}</p>
              </div>
              <Link href="/dashboard">
                <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300">
                  ← Retour
                </button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {audit.status === 'pending' && (
            <div className="card mb-8 bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600"></div>
                <div>
                  <h3 className="font-semibold text-yellow-900">Audit en cours...</h3>
                  <p className="text-sm text-yellow-800">
                    L'analyse est en cours. Cette page se mettra à jour automatiquement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {audit.status === 'failed' && (
            <div className="card mb-8 bg-red-50 border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Audit échoué</h3>
              <p className="text-sm text-red-800">
                {audit.crawl_data?.error || 'Une erreur est survenue lors de l\'audit.'}
              </p>
            </div>
          )}

          {audit.status === 'completed' && (
            <>
              {/* Score global */}
              <div className="card mb-8 text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Score Global</h2>
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBg(audit.score)} mb-4`}>
                  <span className={`text-5xl font-bold ${getScoreColor(audit.score)}`}>
                    {audit.score}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">sur 100</p>
                
                {audit.ppt_path && (
                  <button
                    onClick={downloadPPT}
                    className="btn btn-success text-lg px-8 py-3"
                  >
                    📥 Télécharger le rapport PowerPoint
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card text-center">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Pages Analysées</h3>
                  <p className="text-3xl font-bold text-primary">{audit.total_pages}</p>
                </div>
                <div className="card text-center">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Erreurs</h3>
                  <p className="text-3xl font-bold text-red-600">{audit.total_errors}</p>
                </div>
                <div className="card text-center">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Avertissements</h3>
                  <p className="text-3xl font-bold text-yellow-600">{audit.total_warnings}</p>
                </div>
                <div className="card text-center">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Opportunités</h3>
                  <p className="text-3xl font-bold text-blue-600">{audit.total_opportunities}</p>
                </div>
              </div>

              {/* Web Vitals */}
              {audit.web_vitals && (
                <div className="card mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Core Web Vitals</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">LCP</h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {audit.web_vitals.metrics?.lcp?.displayValue || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Largest Contentful Paint</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">FID/TBT</h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {audit.web_vitals.metrics?.fid?.displayValue || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">First Input Delay</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">CLS</h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {audit.web_vitals.metrics?.cls?.displayValue || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Cumulative Layout Shift</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Issues */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Erreurs */}
                <div className="card">
                  <h3 className="text-lg font-bold text-red-600 mb-4">
                    🔴 Erreurs ({audit.issues?.errors?.length || 0})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {audit.issues?.errors?.slice(0, 10).map((issue, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-sm text-red-900">{issue.title}</h4>
                        <p className="text-xs text-red-700 mt-1">{issue.description}</p>
                        <p className="text-xs text-red-600 mt-1 font-mono truncate">{issue.url}</p>
                      </div>
                    )) || <p className="text-sm text-gray-500">Aucune erreur détectée ✅</p>}
                  </div>
                </div>

                {/* Warnings */}
                <div className="card">
                  <h3 className="text-lg font-bold text-yellow-600 mb-4">
                    ⚠️ Avertissements ({audit.issues?.warnings?.length || 0})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {audit.issues?.warnings?.slice(0, 10).map((issue, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-sm text-yellow-900">{issue.title}</h4>
                        <p className="text-xs text-yellow-700 mt-1">{issue.description}</p>
                        <p className="text-xs text-yellow-600 mt-1 font-mono truncate">{issue.url}</p>
                      </div>
                    )) || <p className="text-sm text-gray-500">Aucun avertissement</p>}
                  </div>
                </div>

                {/* Opportunités */}
                <div className="card">
                  <h3 className="text-lg font-bold text-blue-600 mb-4">
                    💡 Opportunités ({audit.issues?.opportunities?.length || 0})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {audit.issues?.opportunities?.slice(0, 10).map((issue, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-sm text-blue-900">{issue.title}</h4>
                        <p className="text-xs text-blue-700 mt-1">{issue.description}</p>
                        <p className="text-xs text-blue-600 mt-1 font-mono truncate">{issue.url}</p>
                      </div>
                    )) || <p className="text-sm text-gray-500">Aucune opportunité identifiée</p>}
                  </div>
                </div>
              </div>

              {/* Download reminder */}
              {audit.ppt_path && (
                <div className="card mt-8 bg-green-50 border border-green-200 text-center">
                  <h3 className="font-semibold text-green-900 mb-2">
                    📄 Rapport complet disponible
                  </h3>
                  <p className="text-sm text-green-800 mb-4">
                    Téléchargez le rapport PowerPoint pour avoir l'analyse complète avec toutes les recommandations
                  </p>
                  <button
                    onClick={downloadPPT}
                    className="btn btn-success"
                  >
                    Télécharger le PowerPoint
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  )
}
