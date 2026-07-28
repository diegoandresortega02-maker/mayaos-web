import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMyClinic, getPatient } from '../../lib/api'
import {
  ANAMNESIS_QUESTIONS,
  EXAMEN_BUCAL_QUESTIONS,
  SENSITIVITY_FIELDS,
  type Clinic,
  type Patient,
} from '../../lib/types'

function yesNo(value: boolean | null): string {
  return value === true ? 'Sí' : value === false ? 'No' : 'Sin evaluar'
}

export default function PrintClinicalHistoryView() {
  const { id } = useParams<{ id: string }>()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([getMyClinic(), getPatient(id)]).then(([c, p]) => {
      setClinic(c)
      setPatient(p)
    })
  }, [id])

  if (!clinic || !patient) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

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

      <div className="flex items-center gap-3 mb-1">
        {clinic.logo_url && <img src={clinic.logo_url} alt="" className="h-10 w-10 object-contain" />}
        <h1 className="text-xl font-semibold text-ink">{clinic.name}</h1>
      </div>
      {(clinic.address || clinic.phone) && (
        <p className="text-xs text-slate-500 mb-1">{[clinic.address, clinic.phone].filter(Boolean).join(' · ')}</p>
      )}
      <h2 className="text-lg font-semibold text-ink mb-6">Historia clínica</h2>

      <table className="w-full text-sm mb-6">
        <tbody>
          <tr>
            <td className="font-medium text-slate-600 py-1 w-48">Paciente</td>
            <td>{patient.full_name}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">N° de historia clínica (CI)</td>
            <td>{patient.identification || '—'}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Edad / Sexo</td>
            <td>
              {patient.age || '—'} / {patient.sex || '—'}
            </td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Fecha de nacimiento</td>
            <td>{patient.birth_date ? new Date(patient.birth_date).toLocaleDateString() : '—'}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Teléfono</td>
            <td>{patient.phone || '—'}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Correo</td>
            <td>{patient.email || '—'}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Dirección</td>
            <td>{patient.address || '—'}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Alergias</td>
            <td>{patient.allergies || '—'}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Fecha de apertura</td>
            <td>
              {patient.clinical_history_started_at
                ? new Date(patient.clinical_history_started_at).toLocaleDateString()
                : '—'}
            </td>
          </tr>
        </tbody>
      </table>

      {patient.titular_full_name && (
        <table className="w-full text-sm mb-6">
          <tbody>
            <tr>
              <td className="font-semibold text-ink py-1 w-48" colSpan={2}>
                Titular / Responsable
              </td>
            </tr>
            <tr>
              <td className="font-medium text-slate-600 py-1 w-48">Nombre</td>
              <td>{patient.titular_full_name}</td>
            </tr>
            <tr>
              <td className="font-medium text-slate-600 py-1">CI</td>
              <td>{patient.titular_identification || '—'}</td>
            </tr>
            <tr>
              <td className="font-medium text-slate-600 py-1">Teléfono</td>
              <td>{patient.titular_phone || '—'}</td>
            </tr>
            <tr>
              <td className="font-medium text-slate-600 py-1">Relación</td>
              <td>{patient.titular_relationship || '—'}</td>
            </tr>
          </tbody>
        </table>
      )}

      <h3 className="text-sm font-semibold text-slate-700 mb-2">Pruebas de sensibilidad</h3>
      <table className="w-full text-sm mb-6 border border-surface-border">
        <tbody className="divide-y divide-slate-100">
          {SENSITIVITY_FIELDS.map((f) => (
            <tr key={String(f.key)}>
              <td className="px-3 py-1.5 text-slate-600">{f.label}</td>
              <td className="px-3 py-1.5 text-right font-medium">{yesNo(patient[f.key] as boolean | null)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-sm font-semibold text-slate-700 mb-1">Anamnesis</h3>
      <p className="text-xs text-slate-500 mb-2">Antecedentes médicos</p>
      <table className="w-full text-sm mb-2 border border-surface-border">
        <tbody className="divide-y divide-slate-100">
          {ANAMNESIS_QUESTIONS.map((q) => (
            <tr key={q.key}>
              <td className="px-3 py-1.5 text-slate-600">{q.label}</td>
              <td className="px-3 py-1.5 text-right font-medium w-28">{yesNo(patient[q.key] as boolean | null)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {patient.anamnesis_detalle && (
        <p className="text-sm mb-6">
          <span className="font-medium text-slate-600">Detalle: </span>
          {patient.anamnesis_detalle}
        </p>
      )}

      <h3 className="text-sm font-semibold text-slate-700 mb-1">Examen bucal / dental</h3>
      <p className="text-xs text-slate-500 mb-2">Hábitos e higiene bucal</p>
      <table className="w-full text-sm mb-2 border border-surface-border">
        <tbody className="divide-y divide-slate-100">
          {EXAMEN_BUCAL_QUESTIONS.map((q) => (
            <tr key={q.key}>
              <td className="px-3 py-1.5 text-slate-600">{q.label}</td>
              <td className="px-3 py-1.5 text-right font-medium w-28">{yesNo(patient[q.key] as boolean | null)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="w-full text-sm mb-2">
        <tbody>
          <tr>
            <td className="font-medium text-slate-600 py-1 w-64">Fecha de última visita dental</td>
            <td>
              {patient.exam_fecha_ultima_visita
                ? new Date(patient.exam_fecha_ultima_visita).toLocaleDateString()
                : '—'}
            </td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Veces al día que cepilla sus dientes</td>
            <td>{patient.exam_cepillado_veces_dia ?? '—'}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Tratamientos previos</td>
            <td>{patient.exam_tratamientos_previos || '—'}</td>
          </tr>
        </tbody>
      </table>
      {patient.exam_detalle && (
        <p className="text-sm mb-6">
          <span className="font-medium text-slate-600">Detalle: </span>
          {patient.exam_detalle}
        </p>
      )}

      <div className="flex justify-between gap-8 mt-16 text-center text-sm">
        <div className="flex-1">
          <div className="border-t border-ink pt-1">Firma del paciente / responsable</div>
        </div>
        <div className="flex-1">
          <div className="border-t border-ink pt-1">Firma del profesional</div>
        </div>
      </div>
    </div>
  )
}
