import { useEffect, useState } from 'react'
import {
  getTrash,
  restoreBillingItem,
  restoreClinicalRecord,
  restorePatient,
  restoreProforma,
} from '../../lib/api'
import type { TrashItem, TrashItemType } from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'

const TYPE_LABELS: Record<TrashItemType, string> = {
  patient: 'Pacientes',
  proforma: 'Proformas',
  clinical_record: 'Consultas',
  billing_item: 'Cobros',
  receipt: 'Recibos',
}

const TYPE_ORDER: TrashItemType[] = ['patient', 'proforma', 'clinical_record', 'billing_item', 'receipt']

function daysLeft(deletedAt: string): number {
  const elapsed = (Date.now() - new Date(deletedAt).getTime()) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.ceil(30 - elapsed))
}

export default function Papelera() {
  const [items, setItems] = useState<TrashItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      setItems(await getTrash())
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al cargar la papelera'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleRestore(item: TrashItem) {
    setRestoringId(item.id)
    setError(null)
    try {
      if (item.type === 'patient') await restorePatient(item.id)
      else if (item.type === 'proforma') await restoreProforma(item.id)
      else if (item.type === 'clinical_record') await restoreClinicalRecord(item.id)
      else if (item.type === 'billing_item') await restoreBillingItem(item.id)
      await load()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'No se pudo restaurar'))
    } finally {
      setRestoringId(null)
    }
  }

  // Agrupado por día de eliminación, y dentro de cada día por tipo.
  const byDay = new Map<string, TrashItem[]>()
  for (const item of items) {
    const day = item.deleted_at.slice(0, 10)
    const list = byDay.get(day)
    if (list) list.push(item)
    else byDay.set(day, [item])
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-1">Papelera</h1>
      <p className="text-sm text-slate-500 mb-6">
        Lo que eliminás se guarda acá 30 días y después se borra definitivamente. Podés restaurarlo mientras tanto.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">La papelera está vacía.</p>
      ) : (
        <div className="space-y-6">
          {[...byDay.entries()].map(([day, dayItems]) => (
            <section key={day}>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">
                {new Date(`${day}T12:00:00`).toLocaleDateString('es-BO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <div className="space-y-3">
                {TYPE_ORDER.filter((type) => dayItems.some((i) => i.type === type)).map((type) => (
                  <div key={type} className="bg-white rounded-card border border-surface-border">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 pt-3">
                      {TYPE_LABELS[type]}
                    </p>
                    <div className="divide-y divide-slate-100">
                      {dayItems
                        .filter((i) => i.type === type)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-ink truncate">{item.label}</p>
                              <p className="text-xs text-slate-500">
                                {[
                                  item.type !== 'patient' ? item.patient_name : null,
                                  new Date(item.deleted_at).toLocaleTimeString('es-BO', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }),
                                  item.deleted_by_name ? `por ${item.deleted_by_name}` : null,
                                  `se borra en ${daysLeft(item.deleted_at)} día(s)`,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            </div>
                            {item.cascaded ? (
                              <span className="shrink-0 text-xs text-slate-400">
                                se restaura junto con {item.type === 'receipt' ? 'su cobro' : item.patient_name}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRestore(item)}
                                disabled={restoringId === item.id}
                                className="shrink-0 bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-xs font-medium rounded-control px-3 py-1.5"
                              >
                                {restoringId === item.id ? 'Restaurando…' : 'Restaurar'}
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
