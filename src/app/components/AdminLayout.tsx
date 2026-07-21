import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/auth'
import logoWordmark from '../../assets/brand/logo-wordmark.png'

const navItems = [
  { to: '/admin/solicitudes', label: 'Solicitudes de pago' },
  { to: '/admin/consultorios', label: 'Consultorios' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-surface-muted">
      <aside className="w-56 shrink-0 bg-ink border-r border-surface-border flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <img src={logoWordmark} alt="MayaOS" className="h-6 w-auto brightness-0 invert" />
          <p className="text-xs text-white/50 mt-1.5">Panel admin</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
        <Outlet />
      </main>
    </div>
  )
}
