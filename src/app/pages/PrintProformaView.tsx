import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMyClinic, getPatient, getProforma, shareProforma } from '../../lib/api'
import type { Clinic, Patient, Proforma } from '../../lib/types'
import ProformaDocument from '../components/ProformaDocument'
import DocumentActions from '../components/DocumentActions'

export default function PrintProformaView() {
  const { patientId, proformaId } = useParams<{ patientId: string; proformaId: string }>()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [proforma, setProforma] = useState<Proforma | null>(null)
  const docRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!patientId || !proformaId) return
    Promise.all([getMyClinic(), getPatient(patientId), getProforma(proformaId)]).then(([c, p, pf]) => {
      setClinic(c)
      setPatient(p)
      setProforma(pf)
    })
  }, [patientId, proformaId])

  if (!clinic || !patient || !proforma) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  const proformaLabel = `N° ${String(proforma.proforma_number).padStart(4, '0')}`

  return (
    <div className="max-w-3xl mx-auto p-8 print:p-0">
      <DocumentActions
        targetRef={docRef}
        filename={`Proforma-${String(proforma.proforma_number).padStart(4, '0')}.pdf`}
        share={{
          createLink: () => shareProforma(proforma.id),
          patientPhone: patient.phone,
          buildMessage: (url) =>
            `Hola ${patient.full_name}, te comparto la proforma ${proformaLabel} de ${clinic.name}.\n\n${url}\n\n` +
            `El enlace vence en 10 días: descargala y guardala.`,
        }}
      />
      <div ref={docRef}>
        <ProformaDocument
          doc={{
            clinic_name: clinic.name,
            clinic_logo_url: clinic.logo_url,
            clinic_address: clinic.address,
            clinic_phone: clinic.phone,
            patient_name: patient.full_name,
            proforma_number: proforma.proforma_number,
            subtotal: proforma.subtotal,
            discount_bs: proforma.discount_bs,
            total: proforma.total,
            valid_until: proforma.valid_until,
            created_at: proforma.created_at,
            items: proforma.proforma_items ?? [],
          }}
        />
      </div>
    </div>
  )
}
