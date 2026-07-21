import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createConsent, getPatient } from '../../lib/api'
import type { Patient } from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'
import SignaturePad, { type SignaturePadHandle } from '../components/SignaturePad'

// Texto genérico de consentimiento informado — el consultorio todavía no proveyó su texto
// real, así que arrancamos con este placeholder. Reemplazar este único bloque cuando lo tengan.
export const DEFAULT_CONSENT_TEXT = `CONSENTIMIENTO INFORMADO PARA TRATAMIENTO ODONTOLÓGICO

Declaro que el/la odontólogo/a tratante me ha explicado, en lenguaje claro y comprensible, mi diagnóstico, el tratamiento propuesto, sus objetivos, las alternativas de tratamiento disponibles, así como los riesgos, molestias y posibles complicaciones asociadas a dicho tratamiento y a la anestesia, si corresponde.

He tenido la oportunidad de realizar las preguntas que consideré necesarias y estas fueron respondidas a mi satisfacción. Entiendo que ningún tratamiento odontológico garantiza un resultado exacto y que pueden presentarse complicaciones incluso cuando el procedimiento se realiza correctamente.

Autorizo de manera libre, voluntaria e informada a que se me realice el tratamiento odontológico acordado con el/la profesional, así como los procedimientos adicionales que, a criterio clínico, resulten necesarios durante su ejecución.

Declaro asimismo haber informado verazmente sobre mis antecedentes médicos relevantes.`

export default function ConsentSign() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const signatureRef = useRef<SignaturePadHandle>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [hasSignature, setHasSignature] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!patientId) return
    getPatient(patientId)
      .then(setPatient)
      .catch((err) => setError(getErrorMessage(err, 'Error al cargar el paciente')))
  }, [patientId])

  async function handleSave() {
    if (!patientId) return
    const dataUrl = signatureRef.current?.getDataUrl()
    if (!dataUrl) {
      setError('Falta la firma del paciente')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createConsent(patientId, DEFAULT_CONSENT_TEXT, dataUrl)
      navigate(`/pacientes/${patientId}`)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al guardar el consentimiento'))
    } finally {
      setSaving(false)
    }
  }

  if (error && !patient) return <p className="p-8 text-sm text-red-600">{error}</p>
  if (!patient) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Link to={`/pacientes/${patientId}`} className="text-sm text-slate-500 hover:text-slate-700">
          ← Volver al paciente
        </Link>
        <h1 className="text-xl font-semibold text-ink mt-1">Nuevo consentimiento informado</h1>
        <p className="text-sm text-slate-500">{patient.full_name}</p>
      </div>

      <section className="bg-white rounded-card border border-surface-border p-5">
        <p className="text-sm text-ink whitespace-pre-line">{DEFAULT_CONSENT_TEXT}</p>
      </section>

      <section className="bg-white rounded-card border border-surface-border p-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">Firma del paciente</label>
        <SignaturePad ref={signatureRef} onChange={setHasSignature} />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !hasSignature}
        className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control px-4 py-2"
      >
        {saving ? 'Guardando…' : 'Guardar consentimiento firmado'}
      </button>
    </div>
  )
}
