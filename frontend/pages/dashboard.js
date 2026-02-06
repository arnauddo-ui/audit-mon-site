import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import axios from 'axios'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [audits, setAudits] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/')
      return
    }

    setUser(JSON.parse(userData))
    loadData(token)
  }, [])

  const loadData = async (token) => {
    try {
      const [auditsRes, statsRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/audits`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ])

      setAudits(auditsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Erreur chargement:', error)
      if (error.response?.status === 401) {
        router.push('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleDelete = async (auditId, url) => {
    // Confirmation avant suppression
    const confirmation = confirm(
      `⚠️ ATTENTION\n\nVous allez supprimer l'audit de "${url}".\n\nCette action est irréversible.\n\nVoulez-vous continuer ?`
    )
    
    if (!confirmation) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/audits/${auditId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Recharger les données
      loadData(token)
      
      alert('✅ Audit supprimé avec succès')
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression de l\'audit')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - Audit Mon Site</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-primary">Audit Mon Site</h1>
                <p className="text-sm text-gray-600">Bienvenue, {user?.email}</p>
              </div>
              <div className="flex gap-4 items-center">
                <Link href="/new-audit">
                  <button className="btn btn-primary">
                    ➕ Nouvel Audit
                  </button>
                </Link>
                <button onClick={handleLogout} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300">
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Audits</h3>
                <p className="text-3xl font-bold text-primary">{stats.total_audits || 0}</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Audits Complétés</h3>
                <p className="text-3xl font-bold text-success">{stats.completed_audits || 0}</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Pages Crawlées</h3>
                <p className="text-3xl font-bold text-info">{stats.total_pages_crawled || 0}</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Score Moyen</h3>
                <p className="text-3xl font-bold text-warning">
                  {stats.avg_score ? Math.round(stats.avg_score) : 0}/100
                </p>
              </div>
            </div>
          )}

          {/* Liste des audits */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-4">Historique des Audits</h2>
            
            {audits.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Aucun audit pour le moment</p>
                <Link href="/new-audit">
                  <button className="btn btn-primary">
                    Créer votre premier audit
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pages
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {audits.map((audit) => (
                      <tr key={audit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {audit.url}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {new Date(audit.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(audit.status)}`}>
                            {audit.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {audit.score && (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreBadge(audit.score)}`}>
                              {audit.score}/100
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {audit.total_pages || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-3 items-center">
                            <Link href={`/audit/${audit.id}`}>
                              <button className="text-primary hover:text-blue-800 font-medium">
                                Voir →
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(audit.id, audit.url)}
                              className="text-red-600 hover:text-red-800 font-medium"
                              title="Supprimer cet audit"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
