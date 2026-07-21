import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createConsent, getPatient } from '../../lib/api'
import type { Patient } from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'
import { useAuth } from '../AuthContext'
import SignaturePad, { type SignaturePadHandle } from '../components/SignaturePad'

function formatDate(d: Date) {
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Texto real provisto por el consultorio (consentimiento para extracción de diente).
// {{PACIENTE}} y {{FECHA}} se completan automáticamente con los datos del sistema al firmar.
export function buildConsentText(patientName: string, dateStr: string): string {
  return `CONSENTIMIENTO INFORMADO PARA EXTRACCIÓN DE DIENTE

Paciente: ${patientName}
Fecha: ${dateStr}

Descripción del procedimiento

La extracción de un diente es un procedimiento quirúrgico que implica la remoción de un diente de la boca. Esto puede ser necesario debido a diversas razones, como caries avanzadas, enfermedad periodontal, trauma dental o problemas de alineación.

Riesgos y complicaciones

- Dolor y molestias después del procedimiento.
- Sangrado y hematomas.
- Infección.
- Daño a los dientes o tejidos circundantes.
- Reacciones adversas a la anestesia.
- Posibilidad de necesitar tratamiento adicional.

Beneficios

- Alivio del dolor y la incomodidad causados por el diente afectado.
- Prevención de futuras complicaciones y problemas de salud bucal.

Alternativas

- Tratamientos de restauración dental (empastes, coronas, etc.).
- Terapia de conducto radicular.

Declaración de consentimiento

Yo, ${patientName}, he leído y comprendido la información proporcionada sobre la extracción de un diente. He tenido la oportunidad de hacer preguntas y he recibido respuestas satisfactorias. Entiendo que el procedimiento conlleva riesgos y complicaciones, pero también beneficios. Me doy cuenta de que la extracción de un diente es un procedimiento quirúrgico y que es importante seguir las instrucciones del profesional de la salud para minimizar los riesgos.

Consentimiento

Sí, doy mi consentimiento para que se realice la extracción del diente.`
}

export default function ConsentSign() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { clinicUser } = useAuth()
  const patientSigRef = useRef<SignaturePadHandle>(null)
  const professionalSigRef = useRef<SignaturePadHandle>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [hasPatientSignature, setHasPatientSignature] = useState(false)
  const [hasProfessionalSignature, setHasProfessionalSignature] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!patientId) return
    getPatient(patientId)
      .then(setPatient)
      .catch((err) => setError(getErrorMessage(err, 'Error al cargar el paciente')))
  }, [patientId])

  const today = formatDate(new Date())
  const professionalName = clinicUser ? `${clinicUser.first_name} ${clinicUser.last_name}` : ''
  const consentText = patient ? buildConsentText(patient.full_name, today) : ''

  async function handleSave() {
    if (!patientId) return
    const patientDataUrl = patientSigRef.current?.getDataUrl()
    const professionalDataUrl = professionalSigRef.current?.getDataUrl()
    if (!patientDataUrl) {
      setError('Falta la firma del paciente')
      return
    }
    if (!professionalDataUrl) {
      setError('Falta la firma del profesional de la salud')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createConsent(patientId, consentText, patientDataUrl, professionalDataUrl)
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
        <p className="text-sm text-ink whitespace-pre-line">{consentText}</p>
      </section>

      <section className="bg-white rounded-card border border-surface-border p-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">Firma del paciente</label>
        <SignaturePad ref={patientSigRef} onChange={setHasPatientSignature} />
        <p className="text-xs text-slate-500 mt-2">Fecha: {today}</p>
      </section>

      <section className="bg-white rounded-card border border-surface-border p-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Firma del profesional de la salud{professionalName ? ` — ${professionalName}` : ''}
        </label>
        <SignaturePad ref={professionalSigRef} onChange={setHasProfessionalSignature} />
        <p className="text-xs text-slate-500 mt-2">Fecha: {today}</p>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !hasPatientSignature || !hasProfessionalSignature}
        className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control px-4 py-2"
      >
        {saving ? 'Guardando…' : 'Guardar consentimiento firmado'}
      </button>
    </div>
  )
}
