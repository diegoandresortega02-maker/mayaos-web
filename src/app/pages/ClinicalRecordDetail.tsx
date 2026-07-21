import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getClinicalRecord, getOdontogramTeeth, updateClinicalRecord, upsertToothState } from '../../lib/api'
import type { ClinicalRecord, OdontogramTooth } from '../../lib/types'
import Odontogram, { worstCondition } from '../components/Odontogram'
import ToothDetailPanel, { type ToothDraft } from '../components/ToothDetailPanel'
import { getErrorMessage } from '../../lib/errors'

export default function ClinicalRecordDetail() {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>()
  const [record, setRecord] = useState<ClinicalRecord | null>(null)
  const [teeth, setTeeth] = useState<OdontogramTooth[]>([])
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notesError, setNotesError] = useState<string | null>(null)

  useEffect(() => {
    if (!recordId) return
    Promise.all([getClinicalRecord(recordId), getOdontogramTeeth(recordId)])
      .then(([r, t]) => {
        setRecord(r)
        setTeeth(t)
        setMotivo(r.motivo_consulta || '')
        setObservaciones(r.observaciones_generales || '')
      })
      .catch((err) => setError(getErrorMessage(err, 'Error al cargar la consulta')))
  }, [recordId])

  const teethByNumber = Object.fromEntries(teeth.map((t) => [t.tooth_number, t]))

  async function handleSaveTooth(toothNumber: number, draft: ToothDraft) {
    if (!recordId) return
    const color = worstCondition(draft)
    const updated = await upsertToothState(recordId, toothNumber, { ...draft, color })
    setTeeth((prev) => {
      const others = prev.filter((t) => t.tooth_number !== toothNumber)
      return [...others, updated]
    })
  }

  async function handleSaveNotes() {
    if (!recordId) return
    setNotesError(null)
    try {
      const updated = await updateClinicalRecord(recordId, {
        motivo_consulta: motivo || null,
        observaciones_generales: observaciones || null,
      })
      setRecord(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (err) {
      console.error(err)
      setNotesError(getErrorMessage(err, 'Error al guardar las notas'))
    }
  }

  if (error) return <p className="p-8 text-sm text-red-600">{error}</p>
  if (!record) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <Link to={`/pacientes/${patientId}`} className="text-sm text-slate-500 hover:text-slate-700">
          ← Volver al paciente
        </Link>
        <h1 className="text-xl font-semibold text-ink mt-1">Consulta del {record.visit_date}</h1>
      </div>

      <section className="bg-white rounded-card border border-surface-border p-5 space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de consulta</label>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones generales</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        {notesError && <p className="text-sm text-red-600">{notesError}</p>}
        <button
          onClick={handleSaveNotes}
          className="bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium rounded-control px-4 py-2"
        >
          {saved ? 'Guardado ✓' : 'Guardar notas'}
        </button>
      </section>

      <section className="bg-white rounded-card border border-surface-border p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Odontograma</h2>
        <p className="text-xs text-slate-500 mb-4">Hacé clic en un diente para ver y editar su detalle.</p>
        <Odontogram teethByNumber={teethByNumber} selectedTooth={selectedTooth} onSelectTooth={setSelectedTooth} />
      </section>

      {selectedTooth != null && (
        <ToothDetailPanel toothNumber={selectedTooth} tooth={teethByNumber[selectedTooth]} onSave={handleSaveTooth} />
      )}
    </div>
  )
}
