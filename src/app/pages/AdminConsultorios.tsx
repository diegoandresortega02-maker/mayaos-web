import { useEffect, useState } from 'react'
import { adminGetClinics } from '../../lib/api'
import type { Clinic } from '../../lib/types'

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

export default function AdminConsultorios() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminGetClinics()
      .then(setClinics)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar los consultorios'))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-6">Consultorios ({clinics.length})</h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded-card border border-surface-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink text-white text-left text-xs uppercase tracking-wide">
              <th className="px-4 py-2 font-medium">Consultorio</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Plan</th>
              <th className="px-4 py-2 font-medium">Vence</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((c) => (
              <tr key={c.id} className="border-t border-surface-border">
                <td className="px-4 py-2 font-medium text-ink">{c.name}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[c.subscription_status]}`}>
                    {STATUS_LABEL[c.subscription_status]}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500">{c.current_plan_code ?? '—'}</td>
                <td className="px-4 py-2 text-slate-500">
                  {c.subscription_status === 'trial'
                    ? new Date(c.trial_ends_at).toLocaleDateString('es-BO')
                    : c.current_period_end
                      ? new Date(c.current_period_end).toLocaleDateString('es-BO')
                      : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
