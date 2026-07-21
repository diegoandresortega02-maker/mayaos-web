import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAppointmentsByDateRange, getBillingItemsByDateRange, getProformasByDateRange } from '../../lib/api'
import type { Appointment, AppointmentStatus, BillingItem, Proforma } from '../../lib/types'
import { todayKey } from '../components/MonthCalendar'
import { getErrorMessage } from '../../lib/errors'

type PeriodMode = 'dia' | 'mes' | 'anio'

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  programada: 'Programada',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function lastDayOfMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate()
}

function currentMonthValue() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
}

export default function DashboardPage() {
  const [mode, setMode] = useState<PeriodMode>('dia')
  const [day, setDay] = useState(todayKey())
  const [month, setMonth] = useState(currentMonthValue())
  const [year, setYear] = useState(new Date().getFullYear())

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [billingItems, setBillingItems] = useState<BillingItem[]>([])
  const [proformas, setProformas] = useState<Proforma[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { from, to, label } = useMemo(() => {
    if (mode === 'dia') {
      return { from: day, to: day, label: `Día ${day}` }
    }
    if (mode === 'mes') {
      const [y, m] = month.split('-').map(Number)
      const last = lastDayOfMonth(y, m - 1)
      return { from: `${month}-01`, to: `${month}-${pad(last)}`, label: `Mes ${month}` }
    }
    return { from: `${year}-01-01`, to: `${year}-12-31`, label: `Año ${year}` }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, day, month, year])

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getAppointmentsByDateRange(from, to),
      getBillingItemsByDateRange(from, to),
      getProformasByDateRange(from, to),
    ])
      .then(([a, b, p]) => {
        setAppointments(a)
        setBillingItems(b)
        setProformas(p)
      })
      .catch((err) => {
        console.error(err)
        setError(getErrorMessage(err, 'Error al cargar el resumen'))
      })
      .finally(() => setLoading(false))
  }, [from, to])

  const citas = {
    total: appointments.length,
    pendientes: appointments.filter((a) => a.status === 'programada').length,
    atendidas: appointments.filter((a) => a.status === 'completada').length,
    canceladas: appointments.filter((a) => a.status === 'cancelada').length,
  }

  const cobrado = billingItems.reduce((sum, b) => sum + Number(b.paid_amount), 0)
  const facturado = billingItems.reduce((sum, b) => sum + Number(b.subtotal), 0)

  const treatmentRanking = useMemo(() => {
    const counts = new Map<string, number>()
    for (const b of billingItems) {
      counts.set(b.treatment_name, (counts.get(b.treatment_name) || 0) + b.quantity)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [billingItems])

  const proformasTotal = proformas.reduce((sum, p) => sum + Number(p.total), 0)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Resumen del consultorio</h1>
        <p className="text-sm text-slate-500">{label}</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 bg-white rounded-card border border-surface-border p-4">
        <div className="flex gap-2 rounded-control bg-surface-muted p-1">
          {(
            [
              { key: 'dia', label: 'Día' },
              { key: 'mes', label: 'Mes' },
              { key: 'anio', label: 'Año' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              className={`text-sm font-medium rounded px-3 py-1.5 ${
                mode === opt.key ? 'bg-white shadow-sm text-ink' : 'text-slate-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {mode === 'dia' && (
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        )}
        {mode === 'mes' && (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        )}
        {mode === 'anio' && (
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || year)}
            className="w-28 rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Citas">
              <p className="text-2xl font-semibold text-ink">{citas.total}</p>
              <p className="text-xs text-slate-500 mt-1">
                {citas.pendientes} pendientes · {citas.atendidas} atendidas · {citas.canceladas} canceladas
              </p>
            </StatCard>

            <StatCard title="Tratamientos realizados">
              <p className="text-2xl font-semibold text-ink">{billingItems.length}</p>
              <p className="text-xs text-slate-500 mt-1">Cantidad de tratamientos cobrados en el período</p>
            </StatCard>

            <StatCard title="Ingreso">
              <p className="text-2xl font-semibold text-ink">Bs {cobrado.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">Cobrado · Facturado Bs {facturado.toFixed(2)}</p>
            </StatCard>

            <StatCard title="Proformas">
              <p className="text-2xl font-semibold text-ink">{proformas.length}</p>
              <p className="text-xs text-slate-500 mt-1">Cotizado Bs {proformasTotal.toFixed(2)}</p>
            </StatCard>
          </div>

          {treatmentRanking.length > 0 && (
            <section className="bg-white rounded-card border border-surface-border p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Tratamientos más realizados</h2>
              <div className="space-y-2">
                {treatmentRanking.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{name}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {mode !== 'anio' && (
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Citas del período</h2>
              {appointments.length === 0 ? (
                <p className="text-sm text-slate-400">Sin citas en este período.</p>
              ) : (
                <div className="bg-white rounded-card border border-surface-border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-primary text-white text-left text-xs uppercase tracking-wide">
                        <th className="px-4 py-2 font-medium">Paciente</th>
                        <th className="px-4 py-2 font-medium">Fecha</th>
                        <th className="px-4 py-2 font-medium">Hora</th>
                        <th className="px-4 py-2 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {appointments.map((a) => (
                        <tr key={a.id}>
                          <td className="px-4 py-2 font-medium text-ink">
                            <Link to={`/pacientes/${a.patient_id}`} className="hover:underline">
                              {a.patients?.full_name}
                            </Link>
                          </td>
                          <td className="px-4 py-2 text-slate-500">{a.appointment_date}</td>
                          <td className="px-4 py-2 text-slate-500">{a.appointment_time.slice(0, 5)}</td>
                          <td className="px-4 py-2 text-slate-500">{STATUS_LABEL[a.status]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-card border border-surface-border p-4">
      <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
      {children}
    </div>
  )
}
