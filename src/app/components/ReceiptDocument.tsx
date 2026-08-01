import { amountToWordsBs } from '../../lib/numberToWords'

// El recibo en sí, sin botones ni carga de datos: lo renderizan igual la vista
// interna (PrintReceiptView) y la vista pública por token (PublicReceiptView).
export type ReceiptDocumentData = {
  clinic_name: string
  clinic_logo_url: string | null
  clinic_address: string | null
  clinic_phone: string | null
  patient_name: string
  receipt_number: number
  amount: number
  treatment_name: string
  treatment_total: number
  balance_after: number
  issued_at: string
}

export default function ReceiptDocument({ doc }: { doc: ReceiptDocumentData }) {
  const amount = Number(doc.amount)
  const balance = Number(doc.balance_after)

  return (
    <div className="bg-white">
      <div className="flex items-center gap-3 mb-1">
        {doc.clinic_logo_url && <img src={doc.clinic_logo_url} alt="" className="h-10 w-10 object-contain" />}
        <h1 className="text-xl font-semibold text-ink">{doc.clinic_name}</h1>
      </div>
      {(doc.clinic_address || doc.clinic_phone) && (
        <p className="text-xs text-slate-500 mb-1">
          {[doc.clinic_address, doc.clinic_phone].filter(Boolean).join(' · ')}
        </p>
      )}
      <p className="text-sm text-slate-500 mb-1">Recibo de pago</p>
      <p className="text-lg font-semibold text-emerald-600 mb-6">
        N° {String(doc.receipt_number).padStart(4, '0')}
      </p>

      <table className="w-full text-sm mb-6">
        <tbody>
          <tr>
            <td className="font-medium text-slate-600 py-1 w-40">Fecha</td>
            <td>{new Date(doc.issued_at).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1 align-top">Recibí de</td>
            <td>{doc.patient_name}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1 align-top">La suma de</td>
            <td>
              Bs {amount.toFixed(2)} ({amountToWordsBs(amount)})
            </td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Por concepto de</td>
            <td>{doc.treatment_name}</td>
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
            <td className="py-2 border-r border-surface-border font-semibold text-ink">{amount.toFixed(2)}</td>
            <td className="py-2 border-r border-surface-border font-semibold text-ink">{balance.toFixed(2)}</td>
            <td className="py-2 font-semibold text-ink">{Number(doc.treatment_total).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {balance > 0 && (
        <p className="text-sm text-red-600 mb-6">
          El paciente queda debiendo un saldo de Bs {balance.toFixed(2)}.
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
