import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClinicStaff, getMyClinic, removeStaff, updateStaffRole } from '../../lib/api'
import type { ClinicRole, ClinicUser } from '../../lib/types'
import { useAuth } from '../AuthContext'

const ROLE_LABEL: Record<ClinicRole, string> = {
  owner: 'Dueño/a',
  dentist: 'Odontólogo/a',
  assistant: 'Asistente',
}

export default function StaffPage() {
  const { clinicUser } = useAuth()
  const [staff, setStaff] = useState<ClinicUser[]>([])
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [seatLimit, setSeatLimit] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isOwner = clinicUser?.role === 'owner'

  async function load() {
    try {
      const [s, c] = await Promise.all([getClinicStaff(), getMyClinic()])
      setStaff(s)
      setInviteCode(c.invite_code)
      setSeatLimit(1 + c.extra_seats)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error al cargar el equipo')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleRoleChange(id: string, role: ClinicRole) {
    await updateStaffRole(id, role)
    load()
  }

  async function handleRemove(id: string) {
    await removeStaff(id)
    load()
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-2">Equipo</h1>
      {seatLimit !== null && (
        <p className="text-sm text-slate-500 mb-1">
          Usuarios: <strong>{staff.length}</strong> de <strong>{seatLimit}</strong> cupos.
        </p>
      )}
      {inviteCode && (
        <p className="text-sm text-slate-500 mb-2">
          Código de invitación del consultorio:{' '}
          <span className="font-mono bg-surface-muted rounded px-2 py-0.5">{inviteCode}</span>
        </p>
      )}
      {seatLimit !== null && staff.length >= seatLimit && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-control px-3 py-2 mb-4">
          Alcanzaste el límite de usuarios de tu plan.{' '}
          {isOwner ? (
            <>
              Comprá más cupos en{' '}
              <Link to="/facturacion" className="font-medium underline">
                Planes
              </Link>
              .
            </>
          ) : (
            'Pedile al dueño/a del consultorio que compre más cupos.'
          )}
        </p>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded-card border border-surface-border divide-y divide-slate-100">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-medium text-ink">
              {s.first_name} {s.last_name}
            </p>
            <div className="flex items-center gap-3">
              {isOwner && s.role !== 'owner' ? (
                <select
                  value={s.role}
                  onChange={(e) => handleRoleChange(s.id, e.target.value as ClinicRole)}
                  className="text-xs rounded-control border border-surface-border px-2 py-1"
                >
                  <option value="dentist">Odontólogo/a</option>
                  <option value="assistant">Asistente</option>
                </select>
              ) : (
                <span className="text-xs text-slate-500">{ROLE_LABEL[s.role]}</span>
              )}
              {isOwner && s.role !== 'owner' && (
                <button onClick={() => handleRemove(s.id)} className="text-xs text-red-500 hover:underline">
                  Quitar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
