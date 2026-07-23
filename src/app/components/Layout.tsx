import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/auth'
import { getMyClinic } from '../../lib/api'
import { useAuth } from '../AuthContext'
import type { Clinic } from '../../lib/types'
import logoWordmark from '../../assets/brand/logo-wordmark.png'

const navItems = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/pacientes', label: 'Pacientes' },
  { to: '/agenda', label: 'Agenda' },
  { to: '/tratamientos', label: 'Tratamientos' },
  { to: '/caja', label: 'Caja diaria', hideForRoles: ['dentist'] },
  { to: '/equipo', label: 'Equipo' },
  { to: '/facturacion', label: 'Facturación' },
  { to: '/guia', label: 'Guía rápida' },
]

export default function Layout() {
  const navigate = useNavigate()
  const { clinicUser } = useAuth()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 md:w-56 shrink-0 bg-white border-r border-surface-border flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
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
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600 text-xl leading-none px-1"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
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
        <div className="md:hidden flex items-center gap-3 bg-white border-b border-surface-border px-4 py-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-ink text-xl leading-none px-1"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <img src={logoWordmark} alt="MayaOS" className="h-5 w-auto" />
        </div>
        {isExpired && (
          <div className="bg-red-600 text-white text-sm px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
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
