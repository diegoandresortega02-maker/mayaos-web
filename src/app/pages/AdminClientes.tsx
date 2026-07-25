import { useEffect, useState } from 'react'
import { adminGetClinicUsers } from '../../lib/api'
import type { AdminClinicUser, ClinicRole } from '../../lib/types'
import { daysUntilBirthday } from '../../lib/dates'
import { getErrorMessage } from '../../lib/errors'

const ROLE_LABEL: Record<ClinicRole, string> = {
  owner: 'Dueño/a',
  dentist: 'Odontólogo/a',
  assistant: 'Asistente',
}

const STATUS_LABEL: Record<string, string> = {
  trial: 'Prueba',
  active: 'Activo',
  expired: 'Vencido',
}

const STATUS_COLOR: Record<string, string> = {
  trial: 'bg-brand-primary/10 text-brand-primary-dark',
  active: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-red-100 text-red-700',
}

export default function AdminClientes() {
  const [users, setUsers] = useState<AdminClinicUser[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetClinicUsers()
      .then(setUsers)
      .catch((err) => {
        console.error(err)
        setError(getErrorMessage(err, 'Error al cargar los clientes'))
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone ?? '').toLowerCase().includes(q) ||
      (u.identification ?? '').toLowerCase().includes(q) ||
      u.clinic_name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-6">Clientes ({users.length})</h1>

      <input
        placeholder="Buscar por nombre, correo, teléfono, CI o consultorio…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-control border border-surface-border px-3 py-2 text-sm mb-4"
      />

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : (
        <div className="bg-white rounded-card border border-surface-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink text-white text-left text-xs uppercase tracking-wide">
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Correo</th>
                <th className="px-4 py-2 font-medium">Teléfono</th>
                <th className="px-4 py-2 font-medium">CI</th>
                <th className="px-4 py-2 font-medium">Cumpleaños</th>
                <th className="px-4 py-2 font-medium">Rol</th>
                <th className="px-4 py-2 font-medium">Consultorio</th>
                <th className="px-4 py-2 font-medium">Membresía</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const days = daysUntilBirthday(u.birth_date)
                const expiry = u.subscription_status === 'trial' ? u.trial_ends_at : u.current_period_end
                return (
                  <tr key={u.id} className="border-t border-surface-border">
                    <td className="px-4 py-2 font-medium text-ink">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="px-4 py-2 text-slate-500">{u.email}</td>
                    <td className="px-4 py-2 text-slate-500">{u.phone ?? '—'}</td>
                    <td className="px-4 py-2 text-slate-500">{u.identification ?? '—'}</td>
                    <td className="px-4 py-2 text-slate-500">
                      {days === null ? (
                        '—'
                      ) : days <= 30 ? (
                        <span className="text-brand-energy font-medium">
                          🎂 {days === 0 ? 'hoy' : `en ${days}d`}
                        </span>
                      ) : (
                        new Date(u.birth_date!).toLocaleDateString('es-BO')
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-500">{ROLE_LABEL[u.role]}</td>
                    <td className="px-4 py-2 text-slate-500">{u.clinic_name}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[u.subscription_status]}`}>
                        {STATUS_LABEL[u.subscription_status]}
                      </span>
                      {expiry && <p className="text-xs text-slate-400 mt-0.5">{new Date(expiry).toLocaleDateString('es-BO')}</p>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
