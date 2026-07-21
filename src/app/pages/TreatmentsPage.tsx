import { useEffect, useState } from 'react'
import { createTreatment, deleteTreatment, getTreatments, updateTreatment } from '../../lib/api'
import type { Treatment } from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'
import { useAuth } from '../AuthContext'

export default function TreatmentsPage() {
  const { clinicUser } = useAuth()
  const isOwner = clinicUser?.role === 'owner'
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setTreatments(await getTreatments())
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al cargar tratamientos'))
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createTreatment({ name, cost: Number(cost) || 0 })
      setName('')
      setCost('')
      load()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al crear el tratamiento'))
    }
  }

  async function handleCostChange(id: string, newCost: string) {
    try {
      await updateTreatment(id, { cost: Number(newCost) || 0 })
      load()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al actualizar el precio'))
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTreatment(id)
      load()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al eliminar el tratamiento'))
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-6">Catálogo de tratamientos</h1>

      {isOwner && (
        <form onSubmit={handleSubmit} className="bg-white rounded-card border border-surface-border p-4 flex gap-2 mb-4">
          <input
            placeholder="Nombre del tratamiento"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-control border border-surface-border px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Costo"
            required
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-32 rounded-control border border-surface-border px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium rounded-control px-4 py-2">
            Agregar
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded-card border border-surface-border divide-y divide-slate-100">
        {treatments.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-medium text-ink">{t.name}</p>
            {isOwner ? (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={t.cost}
                  onBlur={(e) => handleCostChange(t.id, e.target.value)}
                  className="w-24 rounded-control border border-surface-border px-2 py-1 text-sm text-right"
                />
                <button onClick={() => handleDelete(t.id)} className="text-xs text-red-500 hover:underline">
                  Eliminar
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">{Number(t.cost).toFixed(2)}</p>
            )}
          </div>
        ))}
        {treatments.length === 0 && <p className="px-4 py-3 text-sm text-slate-400">Sin tratamientos todavía.</p>}
      </div>
    </div>
  )
}
