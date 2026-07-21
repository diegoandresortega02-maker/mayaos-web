import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getClinicalRecord, getOdontogramTeeth, getPatient } from '../../lib/api'
import type { ClinicalRecord, OdontogramTooth, Patient } from '../../lib/types'
import Odontogram from '../components/Odontogram'

export default function PrintPatientView() {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [record, setRecord] = useState<ClinicalRecord | null>(null)
  const [teeth, setTeeth] = useState<OdontogramTooth[]>([])

  useEffect(() => {
    if (!patientId || !recordId) return
    Promise.all([getPatient(patientId), getClinicalRecord(recordId), getOdontogramTeeth(recordId)]).then(
      ([p, r, t]) => {
        setPatient(p)
        setRecord(r)
        setTeeth(t)
      },
    )
  }, [patientId, recordId])

  if (!patient || !record) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  const teethByNumber = Object.fromEntries(teeth.map((t) => [t.tooth_number, t]))

  return (
    <div className="max-w-3xl mx-auto p-8 print:p-0">
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium rounded-control px-4 py-2"
        >
          Imprimir
        </button>
      </div>

      <h1 className="text-xl font-semibold text-ink mb-1">Ficha odontológica</h1>
      <p className="text-sm text-slate-500 mb-6">Consulta del {record.visit_date}</p>

      <table className="w-full text-sm mb-6">
        <tbody>
          <tr>
            <td className="font-medium text-slate-600 py-1 w-40">Paciente</td>
            <td>{patient.full_name}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Edad / Sexo</td>
            <td>
              {patient.age || '—'} / {patient.sex || '—'}
            </td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Teléfono</td>
            <td>{patient.phone || '—'}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Alergias</td>
            <td>{patient.allergies || '—'}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Motivo de consulta</td>
            <td>{record.motivo_consulta || '—'}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Observaciones</td>
            <td>{record.observaciones_generales || '—'}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-sm font-semibold text-slate-700 mb-3">Odontograma</h2>
      <Odontogram teethByNumber={teethByNumber} readOnly />
    </div>
  )
}
