import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinClinicWithCode, registerClinic, signOut, type ContactDetails } from '../../lib/auth'
import { useAuth } from '../AuthContext'
import type { ClinicRole } from '../../lib/types'
import AuthCard from '../components/AuthCard'
import LegalCheckbox from '../components/LegalCheckbox'
import { trackEvent } from '../../lib/analytics'

const emptyContact: ContactDetails = { firstName: '', lastName: '', phone: '', address: '' }

export default function Onboarding() {
  const navigate = useNavigate()
  const { refreshClinicUser } = useAuth()
  const [mode, setMode] = useState<'create' | 'join'>('create')

  const [clinicName, setClinicName] = useState('')
  const [ownerContact, setOwnerContact] = useState<ContactDetails>(emptyContact)
  const [ownerAcceptedTerms, setOwnerAcceptedTerms] = useState(false)

  const [inviteCode, setInviteCode] = useState('')
  const [staffContact, setStaffContact] = useState<ContactDetails>(emptyContact)
  const [role, setRole] = useState<ClinicRole>('dentist')
  const [staffAcceptedTerms, setStaffAcceptedTerms] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await registerClinic(clinicName, ownerContact, ownerAcceptedTerms)
      trackEvent('clinic_created')
      await refreshClinicUser()
      navigate('/pacientes')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error al crear el consultorio')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await joinClinicWithCode(inviteCode.trim(), staffContact, role, staffAcceptedTerms)
      trackEvent('staff_joined', { role })
      await refreshClinicUser()
      navigate('/pacientes')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Código de invitación inválido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      step={{ current: 2, total: 2 }}
      title="Configura tu consultorio"
      subtitle="Crea un consultorio nuevo o únete a uno existente con un código"
      footer={
        <button
          onClick={() => signOut().then(() => navigate('/login'))}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Cerrar sesión
        </button>
      }
    >
      <div className="flex gap-2 mb-6 rounded-control bg-surface-muted p-1">
        <button
          className={`flex-1 text-sm font-medium rounded py-1.5 ${mode === 'create' ? 'bg-white shadow-sm text-ink' : 'text-slate-500'}`}
          onClick={() => setMode('create')}
        >
          Crear consultorio
        </button>
        <button
          className={`flex-1 text-sm font-medium rounded py-1.5 ${mode === 'join' ? 'bg-white shadow-sm text-ink' : 'text-slate-500'}`}
          onClick={() => setMode('join')}
        >
          Unirme con código
        </button>
      </div>

      {mode === 'create' ? (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del consultorio</label>
            <input
              required
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <ContactFields contact={ownerContact} onChange={setOwnerContact} />
          <LegalCheckbox checked={ownerAcceptedTerms} onChange={setOwnerAcceptedTerms} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !ownerAcceptedTerms}
            className="w-full bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white font-medium rounded-control py-2 text-sm"
          >
            {loading ? 'Creando…' : 'Crear consultorio'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Código de invitación</label>
            <input
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <ContactFields contact={staffContact} onChange={setStaffContact} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tu rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ClinicRole)}
              className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="dentist">Odontólogo/a</option>
              <option value="assistant">Asistente / Recepción</option>
            </select>
          </div>
          <LegalCheckbox checked={staffAcceptedTerms} onChange={setStaffAcceptedTerms} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !staffAcceptedTerms}
            className="w-full bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white font-medium rounded-control py-2 text-sm"
          >
            {loading ? 'Uniendo…' : 'Unirme al consultorio'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}

function ContactFields({ contact, onChange }: { contact: ContactDetails; onChange: (c: ContactDetails) => void }) {
  function set(field: keyof ContactDetails, value: string) {
    onChange({ ...contact, [field]: value })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
        <input
          required
          value={contact.firstName}
          onChange={(e) => set('firstName', e.target.value)}
          className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
        <input
          required
          value={contact.lastName}
          onChange={(e) => set('lastName', e.target.value)}
          className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
        <input
          required
          type="tel"
          value={contact.phone}
          onChange={(e) => set('phone', e.target.value)}
          className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
        <input
          required
          value={contact.address}
          onChange={(e) => set('address', e.target.value)}
          className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
    </div>
  )
}
