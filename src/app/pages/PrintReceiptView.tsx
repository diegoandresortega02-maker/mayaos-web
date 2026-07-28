import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMyClinic, getPatient, getReceipt } from '../../lib/api'
import type { Clinic, Patient, Receipt } from '../../lib/types'
import { amountToWordsBs } from '../../lib/numberToWords'

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

      <div className="flex items-center gap-3 mb-1">
        {clinic.logo_url && <img src={clinic.logo_url} alt="" className="h-10 w-10 object-contain" />}
        <h1 className="text-xl font-semibold text-ink">{clinic.name}</h1>
      </div>
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
            <td className="font-medium text-slate-600 py-1 w-40">Fecha</td>
            <td>{new Date(receipt.issued_at).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1 align-top">Recibí de</td>
            <td>{patient.full_name}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1 align-top">La suma de</td>
            <td>
              Bs {Number(receipt.amount).toFixed(2)} ({amountToWordsBs(Number(receipt.amount))})
            </td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Por concepto de</td>
            <td>{receipt.treatment_name}</td>
          </tr>
        </tbody>
      </table>

      <table className="w-full text-sm mb-6 border border-surface-border">
        <thead>
          <tr className="bg-surface-muted">
            <th className="font-medium text-slate-600 py-2 border-r border-surface-border">A cuenta</th>
            <th className="font-medium text-slate-600 py-2 border-r border-surface-border">Saldo</th>
            <th className="font-medium text-slate-600 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            <td className="py-2 border-r border-surface-border font-semibold text-ink">
              {Number(receipt.amount).toFixed(2)}
            </td>
            <td className="py-2 border-r border-surface-border font-semibold text-ink">
              {Number(receipt.balance_after).toFixed(2)}
            </td>
            <td className="py-2 font-semibold text-ink">{Number(receipt.treatment_total).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {Number(receipt.balance_after) > 0 && (
        <p className="text-sm text-red-600 mb-6">
          El paciente queda debiendo un saldo de Bs {Number(receipt.balance_after).toFixed(2)}.
        </p>
      )}

      <div className="flex justify-between gap-8 mt-16 text-center text-sm">
        <div className="flex-1">
          <div className="border-t border-ink pt-1">Recibí conforme</div>
        </div>
        <div className="flex-1">
          <div className="border-t border-ink pt-1">Entregué conforme</div>
        </div>
      </div>
    </div>
  )
}
