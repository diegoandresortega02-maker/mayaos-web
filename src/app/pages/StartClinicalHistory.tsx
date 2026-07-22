import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPatient, updatePatient } from '../../lib/api'
import {
  ANAMNESIS_QUESTIONS,
  EXAMEN_BUCAL_QUESTIONS,
  type AnamnesisKey,
  type ExamenBucalKey,
  type Patient,
} from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'

function YesNoQuestion({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <p className="text-sm text-ink">{label}</p>
      <div className="flex gap-1 shrink-0">
        {(
          [
            { label: 'Sí', v: true },
            { label: 'No', v: false },
            { label: 'Sin evaluar', v: null },
          ] as const
        ).map((opt) => (
          <button
            type="button"
            key={opt.label}
            onClick={() => onChange(opt.v)}
            className={`text-xs font-medium rounded-full px-2.5 py-1 border ${
              value === opt.v
                ? opt.v === true
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : opt.v === false
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-surface-muted text-slate-500 border-surface-border'
                : 'bg-white text-slate-400 border-surface-border'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StartClinicalHistory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({})
  const [detalle, setDetalle] = useState('')
  const [examAnswers, setExamAnswers] = useState<Record<string, boolean | null>>({})
  const [examFechaUltimaVisita, setExamFechaUltimaVisita] = useState('')
  const [examTratamientosPrevios, setExamTratamientosPrevios] = useState('')
  const [examCepilladoVecesDia, setExamCepilladoVecesDia] = useState('')
  const [examDetalle, setExamDetalle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getPatient(id)
      .then((p) => {
        setPatient(p)
        setDetalle(p.anamnesis_detalle || '')
        const initial: Record<string, boolean | null> = {}
        for (const q of ANAMNESIS_QUESTIONS) {
          initial[q.key] = p[q.key] as boolean | null
        }
        setAnswers(initial)

        const examInitial: Record<string, boolean | null> = {}
        for (const q of EXAMEN_BUCAL_QUESTIONS) {
          examInitial[q.key] = p[q.key] as boolean | null
        }
        setExamAnswers(examInitial)
        setExamFechaUltimaVisita(p.exam_fecha_ultima_visita || '')
        setExamTratamientosPrevios(p.exam_tratamientos_previos || '')
        setExamCepilladoVecesDia(p.exam_cepillado_veces_dia != null ? String(p.exam_cepillado_veces_dia) : '')
        setExamDetalle(p.exam_detalle || '')
      })
      .catch((err) => setError(getErrorMessage(err, 'Error al cargar el paciente')))
  }, [id])

  function setAnswer(key: AnamnesisKey, value: boolean | null) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  function setExamAnswer(key: ExamenBucalKey, value: boolean | null) {
    setExamAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const alreadyStarted = !!patient?.clinical_history_started_at

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      await updatePatient(id, {
        ...(answers as Record<AnamnesisKey, boolean | null>),
        anamnesis_detalle: detalle || null,
        ...(examAnswers as Record<ExamenBucalKey, boolean | null>),
        exam_fecha_ultima_visita: examFechaUltimaVisita || null,
        exam_tratamientos_previos: examTratamientosPrevios || null,
        exam_cepillado_veces_dia: examCepilladoVecesDia ? Number(examCepilladoVecesDia) : null,
        exam_detalle: examDetalle || null,
        clinical_history_started_at: patient?.clinical_history_started_at ?? new Date().toISOString(),
      })
      navigate(`/pacientes/${id}`)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al guardar el historial clínico'))
    } finally {
      setSaving(false)
    }
  }

  if (error && !patient) return <p className="p-8 text-sm text-red-600">{error}</p>
  if (!patient) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Link to={`/pacientes/${id}`} className="text-sm text-slate-500 hover:text-slate-700">
          ← Volver al paciente
        </Link>
        <h1 className="text-xl font-semibold text-ink mt-1">
          {alreadyStarted ? 'Historial clínico' : 'Iniciar historial clínico'}
        </h1>
        <p className="text-sm text-slate-500">{patient.full_name} · Anamnesis y examen bucal</p>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          N° de historia clínica (CI): {patient.identification || '— sin CI registrado'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-card border border-surface-border p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Anamnesis</h2>
          <p className="text-xs text-slate-500 mb-2">Antecedentes médicos</p>
          <div className="divide-y divide-slate-100">
            {ANAMNESIS_QUESTIONS.map((q) => (
              <YesNoQuestion
                key={q.key}
                label={q.label}
                value={answers[q.key] ?? null}
                onChange={(v) => setAnswer(q.key, v)}
              />
            ))}
          </div>
        </section>

        <section className="bg-white rounded-card border border-surface-border p-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">Detalle adicional (anamnesis)</label>
          <textarea
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            rows={3}
            placeholder="Notas sobre cualquiera de las respuestas anteriores…"
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </section>

        <section className="bg-white rounded-card border border-surface-border p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Examen bucal / dental</h2>
          <p className="text-xs text-slate-500 mb-2">Hábitos e higiene bucal</p>
          <div className="divide-y divide-slate-100">
            {EXAMEN_BUCAL_QUESTIONS.map((q) => (
              <YesNoQuestion
                key={q.key}
                label={q.label}
                value={examAnswers[q.key] ?? null}
                onChange={(v) => setExamAnswer(q.key, v)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de última visita dental</label>
              <input
                type="date"
                value={examFechaUltimaVisita}
                onChange={(e) => setExamFechaUltimaVisita(e.target.value)}
                className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                ¿Cuántas veces al día cepilla sus dientes?
              </label>
              <input
                type="number"
                min={0}
                value={examCepilladoVecesDia}
                onChange={(e) => setExamCepilladoVecesDia(e.target.value)}
                className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">¿Qué tratamientos le han realizado?</label>
              <input
                value={examTratamientosPrevios}
                onChange={(e) => setExamTratamientosPrevios(e.target.value)}
                className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-card border border-surface-border p-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">Detalle adicional (examen bucal)</label>
          <textarea
            value={examDetalle}
            onChange={(e) => setExamDetalle(e.target.value)}
            rows={3}
            placeholder="Observaciones sobre el examen bucal…"
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control px-4 py-2"
        >
          {saving ? 'Guardando…' : alreadyStarted ? 'Guardar cambios' : 'Iniciar historial clínico'}
        </button>
      </form>
    </div>
  )
}
