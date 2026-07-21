import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/auth'
import logoWordmark from '../../assets/brand/logo-wordmark.png'

const navItems = [
  { to: '/admin/solicitudes', label: 'Solicitudes de pago' },
  { to: '/admin/consultorios', label: 'Consultorios' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

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
        className={`w-64 md:w-56 shrink-0 bg-ink border-r border-surface-border flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-start justify-between">
          <div>
            <img src={logoWordmark} alt="MayaOS" className="h-6 w-auto brightness-0 invert" />
            <p className="text-xs text-white/50 mt-1.5">Panel admin</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/50 hover:text-white text-xl leading-none px-1"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block rounded-control px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-2 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full text-left rounded-control px-3 py-2 text-sm font-medium text-white/50 hover:bg-white/5"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden flex items-center gap-3 bg-ink px-4 py-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/70 hover:text-white text-xl leading-none px-1"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <img src={logoWordmark} alt="MayaOS" className="h-5 w-auto brightness-0 invert" />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
