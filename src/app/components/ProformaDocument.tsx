// La proforma en sí, sin botones ni carga de datos: la renderizan igual la vista
// interna (PrintProformaView) y la vista pública por token (PublicProformaView).
export type ProformaDocumentItem = {
  treatment_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type ProformaDocumentData = {
  clinic_name: string
  clinic_logo_url: string | null
  clinic_address: string | null
  clinic_phone: string | null
  patient_name: string
  proforma_number: number
  subtotal: number
  discount_bs: number
  total: number
  valid_until: string
  created_at: string
  items: ProformaDocumentItem[]
}

export default function ProformaDocument({ doc }: { doc: ProformaDocumentData }) {
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
      <p className="text-sm text-slate-500 mb-1">Proforma / Cotización de tratamientos</p>
      <p className="text-lg font-semibold text-brand-tech mb-6">
        N° {String(doc.proforma_number).padStart(4, '0')}
      </p>

      <table className="w-full text-sm mb-6">
        <tbody>
          <tr>
            <td className="font-medium text-slate-600 py-1 w-40">Paciente</td>
            <td>{doc.patient_name}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Fecha</td>
            <td>{new Date(doc.created_at).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Válida hasta</td>
            <td className="font-semibold">{new Date(doc.valid_until).toLocaleDateString()}</td>
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
          {doc.items.map((i, idx) => (
            <tr key={idx}>
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
            <td className="text-right">{Number(doc.subtotal).toFixed(2)}</td>
          </tr>
          <tr>
            <td className="font-medium text-slate-600 py-1">Descuento</td>
            <td className="text-right">{Number(doc.discount_bs).toFixed(2)}</td>
          </tr>
          <tr>
            <td className="font-semibold text-ink py-1 text-base">Total</td>
            <td className="text-right font-semibold text-ink text-base">{Number(doc.total).toFixed(2)}</td>
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
