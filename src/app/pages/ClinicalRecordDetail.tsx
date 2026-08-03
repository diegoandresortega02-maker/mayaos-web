import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getClinicalRecord, getOdontogramTeeth, updateClinicalRecord, upsertToothState } from '../../lib/api'
import type { ClinicalRecord, OdontogramTooth, OdontogramType } from '../../lib/types'
import Odontogram, { archesFor, worstCondition } from '../components/Odontogram'
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
    setRecord(null)
    setTeeth([])
    setError(null)
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

  // Cambiar de dentición no borra nada: sólo deja de mostrar las piezas de la otra.
  const visibleNumbers = record ? new Set([...archesFor(record.odontogram_type).upper, ...archesFor(record.odontogram_type).lower]) : null
  const hiddenTeethCount = visibleNumbers ? teeth.filter((t) => !visibleNumbers.has(t.tooth_number)).length : 0

  async function handleSaveTooth(toothNumber: number, draft: ToothDraft) {
    if (!recordId) return
    const color = worstCondition(draft)
    const updated = await upsertToothState(recordId, toothNumber, { ...draft, color })
    setTeeth((prev) => {
      const others = prev.filter((t) => t.tooth_number !== toothNumber)
      return [...others, updated]
    })
  }

  async function handleChangeOdontogramType(next: OdontogramType) {
    if (!recordId || !record || next === record.odontogram_type) return
    setNotesError(null)
    try {
      const updated = await updateClinicalRecord(recordId, { odontogram_type: next })
      setRecord(updated)
      // La pieza seleccionada casi nunca existe en la otra dentición.
      setSelectedTooth(null)
    } catch (err) {
      console.error(err)
      setNotesError(getErrorMessage(err, 'Error al cambiar el tipo de odontograma'))
    }
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h2 className="text-sm font-semibold text-slate-700">Odontograma</h2>
          <div className="flex rounded-control border border-surface-border overflow-hidden text-xs font-medium">
            {(
              [
                { value: 'adulto', label: 'Adulto' },
                { value: 'pediatrico', label: 'Pediátrico' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChangeOdontogramType(opt.value)}
                className={`px-3 py-1.5 ${
                  record.odontogram_type === opt.value
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-slate-600 hover:bg-surface-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {record.odontogram_type === 'pediatrico'
            ? 'Dentición temporal (piezas 55–65 arriba y 85–75 abajo). Hacé clic en un diente para editarlo.'
            : 'Dentición permanente. Hacé clic en un diente para ver y editar su detalle.'}
        </p>
        <Odontogram
          teethByNumber={teethByNumber}
          selectedTooth={selectedTooth}
          onSelectTooth={setSelectedTooth}
          type={record.odontogram_type}
        />
        {hiddenTeethCount > 0 && (
          <p className="text-xs text-slate-400 mt-4">
            Hay {hiddenTeethCount} pieza(s) cargada(s) en la otra dentición. No se borraron: cambiá el tipo de
            odontograma para verlas.
          </p>
        )}
      </section>

      {selectedTooth != null && (
        <ToothDetailPanel toothNumber={selectedTooth} tooth={teethByNumber[selectedTooth]} onSave={handleSaveTooth} />
      )}
    </div>
  )
}
