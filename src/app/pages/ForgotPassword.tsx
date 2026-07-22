import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../../lib/auth'
import AuthCard from '../components/AuthCard'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error al enviar el correo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Te enviamos un enlace a tu correo para crear una nueva contraseña"
      footer={
        <p className="text-sm text-slate-500">
          <Link to="/login" className="text-brand-primary font-medium">
            ← Volver a iniciar sesión
          </Link>
        </p>
      }
    >
      {sent ? (
        <p className="text-sm text-emerald-600">
          Si el correo <strong>{email}</strong> tiene una cuenta registrada, en unos minutos vas a recibir un enlace
          para restablecer tu contraseña. Revisá también la carpeta de spam.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white font-medium rounded-control py-2 text-sm"
          >
            {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}
