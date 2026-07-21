import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMyClinic, getPatient, getProforma } from '../../lib/api'
import type { Clinic, Patient, Proforma } from '../../lib/types'

export default function PrintProformaView() {
  const { patientId, proformaId } = useParams<{ patientId: string; proformaId: string }>()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [proforma, setProforma] = useState<Proforma | null>(null)

  useEffect(() => {
    if (!patientId || !proformaId) return
    Promise.all([getMyClinic(), getPatient(patientId), getProforma(proformaId)]).then(([c, p, pf]) => {
      setClinic(c)
      setPatient(p)
      setProforma(pf)
    })
  }, [patientId, proformaId])

  if (!clinic || !patient || !proforma) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  const items = proforma.proforma_items || []

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
      <p className="text-sm text-slate-500 mb-6">Proforma / Cotización de tratamientos</p>

      <table className="w-full text-sm mb-6">
        <tbody>
          <tr>
            <td className="font-medium text-slate-600 py-1 w-40">Paciente</td>
            <td>{patient.full_name}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Fecha</td>
            <td>{new Date(proforma.created_at).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Válida hasta</td>
            <td className="font-semibold">{new Date(proforma.valid_until).toLocaleDateString()}</td>
          </tr>
        </tbody>
      </table>

      <table className="w-full text-sm mb-6 border border-surface-border rounded-card overflow-hidden">
        <thead>
          <tr className="bg-surface-muted text-left">
            <th className="px-3 py-2 font-medium text-slate-600">Tratamiento</th>
            <th className="px-3 py-2 font-medium text-slate-600 text-right">Cant.</th>
            <th className="px-3 py-2 font-medium text-slate-600 text-right">Precio unit.</th>
            <th className="px-3 py-2 font-medium text-slate-600 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((i) => (
            <tr key={i.id}>
              <td className="px-3 py-2">{i.treatment_name}</td>
              <td className="px-3 py-2 text-right">{i.quantity}</td>
              <td className="px-3 py-2 text-right">{Number(i.unit_price).toFixed(2)}</td>
              <td className="px-3 py-2 text-right">{Number(i.subtotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="w-full text-sm mb-6">
        <tbody>
          <tr>
            <td className="font-medium text-slate-600 py-1 w-40">Subtotal</td>
            <td className="text-right">{Number(proforma.subtotal).toFixed(2)}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Descuento</td>
            <td className="text-right">{Number(proforma.discount_bs).toFixed(2)}</td>
          </tr>
          <tr>
            <td className="font-semibold text-ink py-1 text-base">Total</td>
            <td className="text-right font-semibold text-ink text-base">{Number(proforma.total).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <p className="text-xs text-slate-500">
        Esta proforma tiene una validez de 10 días a partir de la fecha de emisión y no representa un compromiso de
        pago hasta la aceptación del tratamiento.
      </p>
    </div>
  )
}
