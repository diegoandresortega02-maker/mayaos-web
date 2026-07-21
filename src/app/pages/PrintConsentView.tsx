import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getConsent, getMyClinic, getPatient } from '../../lib/api'
import type { Clinic, Consent, Patient } from '../../lib/types'

export default function PrintConsentView() {
  const { patientId, consentId } = useParams<{ patientId: string; consentId: string }>()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [consent, setConsent] = useState<Consent | null>(null)

  useEffect(() => {
    if (!patientId || !consentId) return
    Promise.all([getMyClinic(), getPatient(patientId), getConsent(consentId)]).then(([c, p, cs]) => {
      setClinic(c)
      setPatient(p)
      setConsent(cs)
    })
  }, [patientId, consentId])

  if (!clinic || !patient || !consent) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  return (
    <div className="max-w-3xl mx-auto p-8 print:p-0">
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium rounded-control px-4 py-2"
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <h1 className="text-xl font-semibold text-ink mb-1">{clinic.name}</h1>
      <p className="text-sm text-slate-500 mb-6">Consentimiento informado</p>

      <table className="w-full text-sm mb-6">
        <tbody>
          <tr>
            <td className="font-medium text-slate-600 py-1 w-40">Paciente</td>
            <td>{patient.full_name}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Fecha de firma</td>
            <td>{new Date(consent.signed_at).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <p className="text-sm text-ink whitespace-pre-line mb-6">{consent.consent_text}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Firma del paciente</p>
          <img
            src={consent.patient_signature_data_url}
            alt="Firma del paciente"
            className="border border-surface-border rounded-control bg-white"
            style={{ maxWidth: 350 }}
          />
        </div>
        {consent.professional_signature_data_url && (
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Firma del profesional de la salud</p>
            <img
              src={consent.professional_signature_data_url}
              alt="Firma del profesional de la salud"
              className="border border-surface-border rounded-control bg-white"
              style={{ maxWidth: 350 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
