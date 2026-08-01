import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMyClinic, getPatient, getReceipt, shareReceipt } from '../../lib/api'
import type { Clinic, Patient, Receipt } from '../../lib/types'
import ReceiptDocument from '../components/ReceiptDocument'
import DocumentActions from '../components/DocumentActions'

export default function PrintReceiptView() {
  const { patientId, receiptId } = useParams<{ patientId: string; receiptId: string }>()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const docRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!patientId || !receiptId) return
    Promise.all([getMyClinic(), getPatient(patientId), getReceipt(receiptId)]).then(([c, p, r]) => {
      setClinic(c)
      setPatient(p)
      setReceipt(r)
    })
  }, [patientId, receiptId])

  if (!clinic || !patient || !receipt) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  const receiptLabel = `N° ${String(receipt.receipt_number).padStart(4, '0')}`

  return (
    <div className="max-w-3xl mx-auto p-8 print:p-0">
      <DocumentActions
        targetRef={docRef}
        filename={`Recibo-${String(receipt.receipt_number).padStart(4, '0')}.pdf`}
        share={{
          createLink: () => shareReceipt(receipt.id),
          patientPhone: patient.phone,
          buildMessage: (url) =>
            `Hola ${patient.full_name}, te comparto tu recibo ${receiptLabel} de ${clinic.name}.\n\n${url}\n\n` +
            `El enlace vence en 10 días: descargalo y guardalo.`,
        }}
      />
      <div ref={docRef}>
        <ReceiptDocument
          doc={{
            clinic_name: clinic.name,
            clinic_logo_url: clinic.logo_url,
            clinic_address: clinic.address,
            clinic_phone: clinic.phone,
            patient_name: patient.full_name,
            receipt_number: receipt.receipt_number,
            amount: receipt.amount,
            treatment_name: receipt.treatment_name,
            treatment_total: receipt.treatment_total,
            balance_after: receipt.balance_after,
            issued_at: receipt.issued_at,
          }}
        />
      </div>
    </div>
  )
}
