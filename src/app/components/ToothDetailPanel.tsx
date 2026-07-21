import { useEffect, useState } from 'react'
import type { OdontogramTooth } from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'
import { TOOTH_CONDITIONS, type Surface } from './Odontogram'

const SURFACE_LABEL: Record<Surface, string> = {
  surface_arriba: 'Arriba',
  surface_izquierda: 'Izquierda',
  surface_medio: 'Centro',
  surface_derecho: 'Derecha',
  surface_abajo: 'Abajo',
}

export interface ToothDraft {
  surface_arriba: string
  surface_izquierda: string
  surface_medio: string
  surface_derecho: string
  surface_abajo: string
  notes: string
  evolution: string
}

function draftFromTooth(tooth: OdontogramTooth | undefined): ToothDraft {
  return {
    surface_arriba: tooth?.surface_arriba || '',
    surface_izquierda: tooth?.surface_izquierda || '',
    surface_medio: tooth?.surface_medio || '',
    surface_derecho: tooth?.surface_derecho || '',
    surface_abajo: tooth?.surface_abajo || '',
    notes: tooth?.notes || '',
    evolution: tooth?.evolution || '',
  }
}

export default function ToothDetailPanel({
  toothNumber,
  tooth,
  onSave,
}: {
  toothNumber: number
  tooth: OdontogramTooth | undefined
  onSave: (toothNumber: number, draft: ToothDraft) => Promise<void>
}) {
  const [draft, setDraft] = useState<ToothDraft>(() => draftFromTooth(tooth))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(draftFromTooth(tooth))
    setSaved(false)
    setError(null)
  }, [toothNumber, tooth])

  function setSurface(surface: Surface, value: string) {
    setDraft((d) => ({ ...d, [surface]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await onSave(toothNumber, draft)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al guardar el diente'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-card border border-surface-border p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Diente {toothNumber}</h3>

      <div className="grid grid-cols-3 gap-2 max-w-xs mb-5">
        <div />
        <SurfaceSelect value={draft.surface_arriba} onChange={(v) => setSurface('surface_arriba', v)} label={SURFACE_LABEL.surface_arriba} />
        <div />
        <SurfaceSelect value={draft.surface_izquierda} onChange={(v) => setSurface('surface_izquierda', v)} label={SURFACE_LABEL.surface_izquierda} />
        <SurfaceSelect value={draft.surface_medio} onChange={(v) => setSurface('surface_medio', v)} label={SURFACE_LABEL.surface_medio} />
        <SurfaceSelect value={draft.surface_derecho} onChange={(v) => setSurface('surface_derecho', v)} label={SURFACE_LABEL.surface_derecho} />
        <div />
        <SurfaceSelect value={draft.surface_abajo} onChange={(v) => setSurface('surface_abajo', v)} label={SURFACE_LABEL.surface_abajo} />
        <div />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones del diente</label>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            rows={3}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Evolución</label>
          <textarea
            value={draft.evolution}
            onChange={(e) => setDraft((d) => ({ ...d, evolution: e.target.value }))}
            rows={3}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control px-4 py-2"
      >
        {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar'}
      </button>
    </div>
  )
}

function SurfaceSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={label}
      className="rounded-control border border-surface-border px-1 py-1.5 text-xs w-full"
    >
      {TOOTH_CONDITIONS.map((c) => (
        <option key={c.code} value={c.code}>
          {c.number} - {c.label}
        </option>
      ))}
    </select>
  )
}
