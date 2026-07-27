import { useEffect, useState } from 'react'
import { adminGetClinics, adminUpdateClinicName, adminUpdateTrialEnd } from '../../lib/api'
import type { Clinic } from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'

function toDateInputValue(iso: string) {
  return iso.slice(0, 10)
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

export default function AdminConsultorios() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [editingTrialId, setEditingTrialId] = useState<string | null>(null)
  const [draftTrialDate, setDraftTrialDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)

  function load() {
    adminGetClinics()
      .then(setClinics)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar los consultorios'))
  }

  useEffect(() => {
    load()
  }, [])

  function startEditing(c: Clinic) {
    setEditingId(c.id)
    setDraftName(c.name)
    setRowError(null)
  }

  async function saveName(id: string) {
    setBusy(true)
    setRowError(null)
    try {
      await adminUpdateClinicName(id, draftName)
      setEditingId(null)
      load()
    } catch (err) {
      console.error(err)
      setRowError(getErrorMessage(err, 'Error al guardar el nombre'))
    } finally {
      setBusy(false)
    }
  }

  function startEditingTrial(c: Clinic) {
    setEditingTrialId(c.id)
    setDraftTrialDate(toDateInputValue(c.trial_ends_at))
    setRowError(null)
  }

  async function saveTrialEnd(id: string) {
    if (!draftTrialDate) return
    setBusy(true)
    setRowError(null)
    try {
      // End of the chosen day, so the clinic keeps access through that whole date.
      const newTrialEndsAt = `${draftTrialDate}T23:59:59`
      await adminUpdateTrialEnd(id, newTrialEndsAt)
      setEditingTrialId(null)
      load()
    } catch (err) {
      console.error(err)
      setRowError(getErrorMessage(err, 'Error al guardar la fecha de prueba'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-6">Consultorios ({clinics.length})</h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {rowError && <p className="text-sm text-red-600 mb-4">{rowError}</p>}

      <div className="bg-white rounded-card border border-surface-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink text-white text-left text-xs uppercase tracking-wide">
              <th className="px-4 py-2 font-medium">Consultorio</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Plan</th>
              <th className="px-4 py-2 font-medium">Vence</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((c) => (
              <tr key={c.id} className="border-t border-surface-border">
                <td className="px-4 py-2 font-medium text-ink">
                  {editingId === c.id ? (
                    <input
                      autoFocus
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="rounded-control border border-surface-border px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[c.subscription_status]}`}>
                    {STATUS_LABEL[c.subscription_status]}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500">{c.current_plan_code ?? '—'}</td>
                <td className="px-4 py-2 text-slate-500">
                  {editingTrialId === c.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="date"
                        value={draftTrialDate}
                        onChange={(e) => setDraftTrialDate(e.target.value)}
                        className="rounded-control border border-surface-border px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => saveTrialEnd(c.id)}
                        disabled={busy}
                        className="text-xs font-medium text-brand-primary-dark hover:underline disabled:opacity-50"
                      >
                        {busy ? 'Guardando…' : 'Guardar'}
                      </button>
                      <button onClick={() => setEditingTrialId(null)} className="text-xs text-slate-500 hover:underline">
                        Cancelar
                      </button>
                    </div>
                  ) : c.subscription_status === 'active' ? (
                    c.current_period_end ? new Date(c.current_period_end).toLocaleDateString('es-BO') : '—'
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{new Date(c.trial_ends_at).toLocaleDateString('es-BO')}</span>
                      <button
                        onClick={() => startEditingTrial(c)}
                        className="text-xs text-slate-500 hover:underline"
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  {editingId === c.id ? (
                    <>
                      <button
                        onClick={() => saveName(c.id)}
                        disabled={busy}
                        className="text-xs font-medium text-brand-primary-dark hover:underline mr-3 disabled:opacity-50"
                      >
                        {busy ? 'Guardando…' : 'Guardar'}
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-slate-500 hover:underline">
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button onClick={() => startEditing(c)} className="text-xs text-slate-500 hover:underline">
                      Editar nombre
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
