import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/auth'
import { getMyClinic } from '../../lib/api'
import { useAuth } from '../AuthContext'
import type { Clinic } from '../../lib/types'
import logoWordmark from '../../assets/brand/logo-wordmark.png'

const navItems = [
  { to: '/pacientes', label: 'Pacientes' },
  { to: '/agenda', label: 'Agenda' },
  { to: '/tratamientos', label: 'Tratamientos' },
  { to: '/caja', label: 'Caja diaria', hideForRoles: ['dentist'] },
  { to: '/equipo', label: 'Equipo' },
  { to: '/facturacion', label: 'Facturación' },
]

export default function Layout() {
  const navigate = useNavigate()
  const { clinicUser } = useAuth()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const visibleNavItems = navItems.filter((item) => !item.hideForRoles?.includes(clinicUser?.role ?? ''))

  useEffect(() => {
    getMyClinic()
      .then(setClinic)
      .catch((err) => console.error(err))
  }, [])

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const isExpired = clinic?.subscription_status === 'expired'
  const trialDaysLeft =
    clinic?.subscription_status === 'trial'
      ? Math.max(0, Math.ceil((new Date(clinic.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null

  return (
    <div className="min-h-screen flex bg-surface-muted">
      <aside className="w-56 shrink-0 bg-white border-r border-surface-border flex flex-col">
        <div className="px-5 py-5 border-b border-slate-100">
          <img src={logoWordmark} alt="MayaOS" className="h-6 w-auto" />
          {clinicUser && (
            <p className="text-xs text-slate-500 mt-1.5">
              {clinicUser.first_name} {clinicUser.last_name}
            </p>
          )}
          {trialDaysLeft !== null && (
            <p className="text-[11px] text-brand-primary-dark font-medium mt-1">
              Prueba: {trialDaysLeft} {trialDaysLeft === 1 ? 'día' : 'días'} restantes
            </p>
          )}
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-control px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-brand-primary/10 text-brand-primary-dark' : 'text-slate-600 hover:bg-surface-muted'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-2 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full text-left rounded-control px-3 py-2 text-sm font-medium text-slate-500 hover:bg-surface-muted"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 flex flex-col">
        {isExpired && (
          <div className="bg-red-600 text-white text-sm px-6 py-2.5 flex items-center justify-between">
            <span>Tu membresía venció — estás en modo de solo lectura.</span>
            <NavLink to="/facturacion" className="font-semibold underline underline-offset-2">
              Renovar ahora
            </NavLink>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
