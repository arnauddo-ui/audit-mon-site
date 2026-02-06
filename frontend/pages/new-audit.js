import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import axios from 'axios'
import Link from 'next/link'

export default function NewAudit() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Valider l'URL
      new URL(url)

      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/audits`,
        { url },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Rediriger vers la page de l'audit
      router.push(`/audit/${response.data.auditId}`)
    } catch (err) {
      if (err.message === 'Invalid URL') {
        setError('URL invalide. Assurez-vous qu\'elle commence par http:// ou https://')
      } else {
        setError(err.response?.data?.error || 'Erreur lors de la création de l\'audit')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Nouvel Audit - Audit Mon Site</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary">Nouvel Audit SEO</h1>
              <Link href="/dashboard">
                <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300">
                  ← Retour
                </button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Lancer un nouvel audit technique
              </h2>
              <p className="text-gray-600">
                Entrez l'URL du site web que vous souhaitez analyser. L'outil va crawler toutes les pages 
                et générer un rapport PowerPoint complet avec toutes les recommandations SEO.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du site à auditer
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input"
                  placeholder="https://example.com"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  L'URL doit commencer par http:// ou https://
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📊 Ce qui sera analysé :
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Toutes les pages du site (crawl complet)</li>
                  <li>✓ Meta tags (title, description, etc.)</li>
                  <li>✓ Structure des headings (H1, H2, H3...)</li>
                  <li>✓ Images (alt, poids, format)</li>
                  <li>✓ Liens internes et externes</li>
                  <li>✓ Core Web Vitals (LCP, FID, CLS)</li>
                  <li>✓ Schema markup et données structurées</li>
                  <li>✓ Sécurité HTTPS</li>
                  <li>✓ Mobile-friendly</li>
                  <li>✓ ... et 300+ autres vérifications !</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  ⏱️ Temps estimé :
                </h3>
                <p className="text-sm text-yellow-800">
                  L'audit peut prendre de 5 à 30 minutes selon la taille du site. 
                  Vous pouvez fermer cette page, l'audit continuera en arrière-plan.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-lg font-semibold"
              >
                {loading ? '🔄 Démarrage de l\'audit...' : '🚀 Lancer l\'audit'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}
