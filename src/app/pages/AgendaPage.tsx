import { useEffect, useMemo, useState } from 'react'
import { createAppointment, deleteAppointment, getAppointments, getPatients, updateAppointment } from '../../lib/api'
import type { Appointment, AppointmentStatus, Patient } from '../../lib/types'
import MonthCalendar, { todayKey } from '../components/MonthCalendar'
import { getErrorMessage } from '../../lib/errors'

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  programada: 'Programada',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [showAll, setShowAll] = useState(false)
  const [selectedRow, setSelectedRow] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    try {
      const [a, p] = await Promise.all([getAppointments(), getPatients()])
      setAppointments(a)
      setPatients(p)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al cargar la agenda'))
    }
  }

  useEffect(() => {
    load()
  }, [])

  const appointmentDates = useMemo(() => new Set(appointments.map((a) => a.appointment_date)), [appointments])

  const displayedAppointments = useMemo(() => {
    const list = showAll ? appointments : appointments.filter((a) => a.appointment_date === selectedDate)
    return [...list].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
  }, [appointments, showAll, selectedDate])

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    setShowAll(false)
    setSelectedRow(null)
  }

  function handleMonthChange(newYear: number, newMonth: number) {
    setYear(newYear)
    setMonth(newMonth)
  }

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    try {
      await updateAppointment(id, { status })
      load()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al actualizar la cita'))
    }
  }

  async function handleDelete() {
    if (!selectedRow) return
    setDeleting(true)
    try {
      await deleteAppointment(selectedRow)
      setSelectedRow(null)
      await load()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al eliminar la cita'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink">Agenda</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium rounded-control px-4 py-2"
        >
          {showForm ? 'Cancelar' : '+ Nueva cita'}
        </button>
      </div>

      {showForm && (
        <NewAppointmentForm
          patients={patients}
          defaultDate={selectedDate}
          onCreated={() => {
            setShowForm(false)
            load()
          }}
        />
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex gap-6 items-start">
        <div className="flex flex-col gap-3">
          <MonthCalendar
            year={year}
            month={month}
            selectedDate={selectedDate}
            appointmentDates={appointmentDates}
            onSelectDate={handleSelectDate}
            onMonthChange={handleMonthChange}
          />
          <button
            onClick={() => {
              setShowAll(true)
              setSelectedRow(null)
            }}
            className="bg-brand-primary-dark hover:bg-brand-primary text-white text-sm font-medium rounded-control px-4 py-2 w-64"
          >
            Todas las citas
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-card border border-surface-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-primary text-white text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 font-medium">Paciente</th>
                  <th className="px-4 py-2 font-medium">Fecha</th>
                  <th className="px-4 py-2 font-medium">Hora</th>
                  <th className="px-4 py-2 font-medium">Asunto</th>
                  <th className="px-4 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {displayedAppointments.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedRow(a.id)}
                    className={`border-t border-surface-border cursor-pointer ${
                      selectedRow === a.id ? 'bg-brand-primary/10' : 'hover:bg-surface-muted'
                    }`}
                  >
                    <td className="px-4 py-2 font-medium text-ink">{a.patients?.full_name}</td>
                    <td className="px-4 py-2 text-slate-500">{a.appointment_date}</td>
                    <td className="px-4 py-2 text-slate-500">{a.appointment_time.slice(0, 5)}</td>
                    <td className="px-4 py-2 text-slate-500">{a.details || '—'}</td>
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.id, e.target.value as AppointmentStatus)}
                        className="text-xs rounded-control border border-surface-border px-2 py-1"
                      >
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedAppointments.length === 0 && (
              <p className="text-sm text-slate-400 px-4 py-6 text-center">
                {showAll ? 'Sin citas registradas.' : 'Sin citas para este día.'}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={handleDelete}
              disabled={!selectedRow || deleting}
              className="bg-white border border-surface-border hover:bg-surface-muted disabled:opacity-40 text-sm font-medium rounded-control px-4 py-2"
            >
              {deleting ? 'Eliminando…' : 'Eliminar cita'}
            </button>
            <button
              onClick={load}
              className="bg-white border border-surface-border hover:bg-surface-muted text-sm font-medium rounded-control px-4 py-2"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewAppointmentForm({
  patients,
  defaultDate,
  onCreated,
}: {
  patients: Patient[]
  defaultDate: string
  onCreated: () => void
}) {
  const [patientId, setPatientId] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('')
  const [details, setDetails] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId) {
      setError('Selecciona un paciente')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createAppointment({ patient_id: patientId, appointment_date: date, appointment_time: time, details })
      setPatientId('')
      setTime('')
      setDetails('')
      onCreated()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al crear la cita'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-card border border-surface-border p-5 mb-4 grid grid-cols-2 gap-3">
      <select
        required
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        className="col-span-2 rounded-control border border-surface-border px-3 py-2 text-sm"
      >
        <option value="">Paciente…</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
          </option>
        ))}
      </select>
      <input
        type="date"
        required
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-control border border-surface-border px-3 py-2 text-sm"
      />
      <input
        type="time"
        required
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="rounded-control border border-surface-border px-3 py-2 text-sm"
      />
      <input
        placeholder="Asunto / Detalles"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        className="col-span-2 rounded-control border border-surface-border px-3 py-2 text-sm"
      />
      {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="col-span-2 bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control py-2"
      >
        {saving ? 'Guardando…' : 'Guardar cita'}
      </button>
    </form>
  )
}
