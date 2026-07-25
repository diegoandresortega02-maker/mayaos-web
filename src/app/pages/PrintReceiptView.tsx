import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMyClinic, getPatient, getReceipt } from '../../lib/api'
import type { Clinic, Patient, Receipt } from '../../lib/types'

export default function PrintReceiptView() {
  const { patientId, receiptId } = useParams<{ patientId: string; receiptId: string }>()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  useEffect(() => {
    if (!patientId || !receiptId) return
    Promise.all([getMyClinic(), getPatient(patientId), getReceipt(receiptId)]).then(([c, p, r]) => {
      setClinic(c)
      setPatient(p)
      setReceipt(r)
    })
  }, [patientId, receiptId])

  if (!clinic || !patient || !receipt) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

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
      {(clinic.address || clinic.phone) && (
        <p className="text-xs text-slate-500 mb-1">{[clinic.address, clinic.phone].filter(Boolean).join(' · ')}</p>
      )}
      <p className="text-sm text-slate-500 mb-1">Recibo de pago</p>
      <p className="text-lg font-semibold text-emerald-600 mb-6">
        N° {String(receipt.receipt_number).padStart(4, '0')}
      </p>

      <table className="w-full text-sm mb-6">
        <tbody>
          <tr>
            <td className="font-medium text-slate-600 py-1 w-40">Paciente</td>
            <td>{patient.full_name}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Fecha</td>
            <td>{new Date(receipt.issued_at).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Tratamiento</td>
            <td>{receipt.treatment_name}</td>
          </tr>
        </tbody>
      </table>

      <table className="w-full text-sm mb-6">
        <tbody>
          <tr>
            <td className="font-semibold text-ink py-1 text-base">Monto pagado</td>
            <td className="text-right font-semibold text-ink text-base">{Number(receipt.amount).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <p className="text-xs text-slate-500">
        Este recibo confirma el pago recibido por el tratamiento indicado. Se generó automáticamente al registrarse
        el cobro como pagado en su totalidad.
      </p>
    </div>
  )
}
