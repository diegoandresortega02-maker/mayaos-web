import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  getAllReceipts,
  getAppointments,
  getBillingItemsByDateRange,
  getClinicStaff,
  getMyClinic,
  getPatients,
  getProformasByDateRange,
  requestDataExport,
} from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'
import type { Appointment, BillingItem, Clinic, ClinicUser, Patient, Proforma, Receipt } from '../../lib/types'

// Cubre "todo el historial" sin necesitar un endpoint dedicado de "traer todo":
// las consultas por rango de fechas ya existentes devuelven todo si el rango es amplio.
const FROM_DATE = '2000-01-01'
const TO_DATE = '2100-12-31'

export default function AuditoriaPage() {
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [billingItems, setBillingItems] = useState<BillingItem[]>([])
  const [proformas, setProformas] = useState<Proforma[]>([])
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [staff, setStaff] = useState<ClinicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [exporting, setExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getMyClinic(),
      getPatients(),
      getAppointments(),
      getBillingItemsByDateRange(FROM_DATE, TO_DATE),
      getProformasByDateRange(FROM_DATE, TO_DATE),
      getAllReceipts(),
      getClinicStaff(),
    ])
      .then(([c, p, a, b, pf, r, s]) => {
        setClinic(c)
        setPatients(p)
        setAppointments(a)
        setBillingItems(b)
        setProformas(pf)
        setReceipts(r)
        setStaff(s)
      })
      .catch((err) => setError(getErrorMessage(err, 'Error al cargar el resumen')))
      .finally(() => setLoading(false))
  }, [])

  async function handleExport() {
    setExporting(true)
    setExportMessage(null)
    try {
      const allowed = await requestDataExport()
      if (!allowed) {
        setExportMessage('Ya usaste tus 3 descargas disponibles esta semana. Volvé a intentar en unos días.')
        return
      }
      const patientName = (id: string) => patients.find((p) => p.id === id)?.full_name ?? '—'
      const roleLabel: Record<string, string> = { owner: 'Dueño/a', dentist: 'Odontólogo/a', assistant: 'Asistente' }

      const wb = XLSX.utils.book_new()

      const addSheet = (name: string, rows: Record<string, unknown>[]) => {
        const ws = XLSX.utils.json_to_sheet(rows)
        XLSX.utils.book_append_sheet(wb, ws, name)
      }

      addSheet(
        'Pacientes',
        patients.map((p) => ({
          Nombre: p.full_name,
          Edad: p.age ?? '',
          Sexo: p.sex ?? '',
          Teléfono: p.phone ?? '',
          Correo: p.email ?? '',
          'Fecha de nacimiento': p.birth_date ?? '',
          CI: p.identification ?? '',
          Dirección: p.address ?? '',
          Alergias: p.allergies ?? '',
        })),
      )

      addSheet(
        'Citas',
        appointments.map((a) => ({
          Paciente: a.patients?.full_name ?? patientName(a.patient_id),
          Fecha: a.appointment_date,
          Hora: a.appointment_time,
          Estado: a.status,
        })),
      )

      addSheet(
        'Cobros',
        billingItems.map((b) => ({
          Paciente: patientName(b.patient_id),
          Tratamiento: b.treatment_name,
          Cantidad: b.quantity,
          'Precio unitario': Number(b.unit_price),
          Subtotal: Number(b.subtotal),
          Cobrado: Number(b.paid_amount),
          Estado: b.status,
          Fecha: b.visit_date,
        })),
      )

      addSheet(
        'Proformas',
        proformas.map((pf) => ({
          'N°': pf.proforma_number,
          Paciente: patientName(pf.patient_id),
          Subtotal: Number(pf.subtotal),
          Descuento: Number(pf.discount_bs),
          Total: Number(pf.total),
          'Válida hasta': pf.valid_until,
          Fecha: pf.created_at?.slice(0, 10),
        })),
      )

      addSheet(
        'Recibos',
        receipts.map((r) => ({
          'N°': r.receipt_number,
          Paciente: patientName(r.patient_id),
          Tratamiento: r.treatment_name,
          Monto: Number(r.amount),
          Fecha: r.issued_at?.slice(0, 10),
        })),
      )

      addSheet(
        'Equipo',
        staff.map((s) => ({
          Nombre: s.first_name,
          Apellido: s.last_name,
          Rol: roleLabel[s.role] ?? s.role,
          Teléfono: s.phone ?? '',
        })),
      )

      const filename = `mayaos-respaldo-${(clinic?.name ?? 'consultorio').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(wb, filename)
      setExportMessage('Descarga lista.')
    } catch (err) {
      console.error(err)
      setExportMessage(getErrorMessage(err, 'Error al preparar la descarga'))
    } finally {
      setExporting(false)
    }
  }

  if (error) return <p className="p-8 text-sm text-red-600">{error}</p>
  if (loading) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Auditoría</h1>
        <p className="text-sm text-slate-500">Un vistazo general a toda la información de tu consultorio.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard title="Pacientes" value={patients.length} />
        <StatCard title="Citas" value={appointments.length} />
        <StatCard title="Cobros" value={billingItems.length} />
        <StatCard title="Proformas" value={proformas.length} />
        <StatCard title="Recibos" value={receipts.length} />
        <StatCard title="Equipo" value={staff.length} />
      </div>

      <section className="bg-white rounded-card border border-surface-border p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Descargar mi información</h2>
        <p className="text-sm text-slate-500 mb-4">
          Genera un Excel con todos los datos de tu consultorio (pacientes, citas, cobros, proformas, recibos y
          equipo, cada uno en su propia hoja) para que tengas tu propio respaldo. Disponible hasta 3 veces por semana.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control px-5 py-2"
        >
          {exporting ? 'Preparando…' : 'Descargar mi información'}
        </button>
        {exportMessage && <p className="text-sm text-slate-600 mt-3">{exportMessage}</p>}
      </section>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-card border border-surface-border p-4">
      <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-ink">{value}</p>
    </div>
  )
}
