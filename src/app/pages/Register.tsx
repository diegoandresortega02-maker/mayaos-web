import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../../lib/auth'
import { useAuth } from '../AuthContext'
import AuthCard from '../components/AuthCard'
import { trackEvent } from '../../lib/analytics'
import { translateAuthError } from '../../lib/errors'

export default function Register() {
  const navigate = useNavigate()
  const { refreshClinicUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const data = await signUp(email, password)
      if (data.session) {
        trackEvent('sign_up', undefined, { email })
        await refreshClinicUser()
        navigate('/onboarding')
      } else if (data.user && data.user.identities?.length === 0) {
        // Supabase doesn't throw for an email that's already registered (anti-enumeration
        // behavior) - it silently returns a userless-identity object instead. This is the
        // documented way to detect it: https://supabase.com/docs/reference/javascript/auth-signup
        setError('Este correo ya tiene una cuenta registrada. Iniciá sesión o recuperá tu contraseña.')
      } else {
        trackEvent('sign_up', undefined, { email })
        setInfo('Revisa tu correo para confirmar la cuenta y luego inicia sesión.')
      }
    } catch (err) {
      console.error(err)
      setError(translateAuthError(err, 'Error al registrarse'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      step={{ current: 1, total: 2 }}
      title="Crea tu cuenta"
      subtitle="Primero tu usuario. Después configuramos tu consultorio."
      footer={
        <p className="text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-primary font-medium">
            Inicia sesión
          </Link>
        </p>
      }
    >
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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white font-medium rounded-control py-2 text-sm"
        >
          {loading ? 'Creando…' : 'Continuar'}
        </button>
      </form>
    </AuthCard>
  )
}
