import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/login`,
        { email, password }
      )

      // Sauvegarder le token (simple pour V1)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Rediriger vers le dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Connexion - Audit Mon Site</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-blue-800">
        <div className="card w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Audit Mon Site</h1>
            <p className="text-gray-600">Outil d'audit SEO technique</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                placeholder="admin@auditmonsite.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Email par défaut: {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'arnaud.doguet@gmail.com'}</p>
            <p className="text-xs mt-1 text-gray-500">Changez le mot de passe après la première connexion</p>
          </div>
        </div>
      </div>
    </>
  )
}
