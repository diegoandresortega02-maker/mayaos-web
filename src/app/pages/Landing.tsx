import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import logoWordmark from '../../assets/brand/logo-wordmark.png'

const FEATURES: { icon: (props: { className?: string }) => ReactElement; title: string; description: string }[] = [
  {
    icon: IconUser,
    title: 'Pacientes',
    description: 'Historia clínica completa: datos personales, alergias y pruebas de sensibilidad en un solo lugar.',
  },
  {
    icon: IconCalendar,
    title: 'Agenda',
    description: 'Calendario mensual con vista por día, estado de cada cita y filtro rápido de "todas las citas".',
  },
  {
    icon: IconTooth,
    title: 'Odontograma',
    description: 'Carta dental interactiva por diente y superficie, con 16 condiciones clínicas y notas de evolución.',
  },
  {
    icon: IconTag,
    title: 'Tratamientos',
    description: 'Catálogo de tratamientos personalizable con precios propios de cada consultorio.',
  },
  {
    icon: IconCard,
    title: 'Cobros',
    description: 'Registro de pagos, saldo pendiente y estado de cuenta por paciente, siempre al día.',
  },
  {
    icon: IconCash,
    title: 'Caja diaria',
    description: 'Arqueo de caja simple: saldo inicial, ingresos, egresos y saldo final calculado al instante.',
  },
  {
    icon: IconBuilding,
    title: 'Multi-consultorio',
    description: 'Cada consultorio ve solo sus propios datos. Sumá odontólogos y asistentes con roles y un código de invitación.',
  },
  {
    icon: IconPrinter,
    title: 'Impresión',
    description: 'Genera la ficha del paciente y su odontograma listos para imprimir o entregar.',
  },
]

export default function Landing() {
  const { session, clinicUser } = useAuth()
  const isLoggedIn = !!session && !!clinicUser

  return (
    <div className="min-h-screen bg-surface-warm">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={logoWordmark} alt="MayaOS" className="h-6 w-auto" />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#funcionalidades" className="hover:text-ink">
              Funcionalidades
            </a>
            <a href="#marca" className="hover:text-ink">
              Por qué MayaOS
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                to="/pacientes"
                className="bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium rounded-control px-4 py-2"
              >
                Ir a mi panel
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-ink">
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium rounded-control px-4 py-2"
                >
                  Comenzar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-brand-primary-dark text-sm font-semibold mb-3">Software para consultorios odontológicos</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-ink leading-tight mb-5">
            La gestión de tu consultorio, simple y en la nube
          </h1>
          <p className="text-slate-500 text-lg mb-8 max-w-md">
            Pacientes, agenda, odontograma, tratamientos y cobros en una sola plataforma. Cuidado humano y precisión
            clínica, conectados por tecnología clara y moderna.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/registro"
              className="bg-brand-primary hover:bg-brand-primary-dark text-white font-medium rounded-control px-6 py-3"
            >
              Comenzar gratis
            </Link>
            <a
              href="#funcionalidades"
              className="border border-surface-border hover:bg-surface-muted text-ink font-medium rounded-control px-6 py-3"
            >
              Ver funcionalidades
            </a>
          </div>
        </div>

        <HeroMockup />
      </section>

      {/* Showcase photo banner */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <ShowcasePhoto
          src="/brand/showcase-consultorio.jpg"
          alt="Odontóloga usando MayaOS en su consultorio"
          className="w-full aspect-[2/1] object-cover rounded-card border border-surface-border"
        />
      </section>

      {/* Features */}
      <section id="funcionalidades" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-ink mb-3">Todo lo que tu consultorio necesita</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Un sistema pensado desde la práctica diaria de un consultorio dental, no un genérico adaptado.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-card border border-surface-border p-6">
              <div className="w-10 h-10 rounded-control bg-brand-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-brand-primary-dark" />
              </div>
              <h3 className="font-semibold text-ink mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story: photo + copy */}
      <section className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-10 items-center">
        <ShowcasePhoto
          src="/brand/showcase-equipo.jpg"
          alt="Equipo de un consultorio dental revisando la agenda"
          className="w-full aspect-square object-cover rounded-card border border-surface-border"
        />
        <div>
          <h2 className="text-2xl font-semibold text-ink mb-3">Pensado para cómo trabaja tu equipo</h2>
          <p className="text-slate-500 mb-4">
            Cada consultorio tiene su propio espacio, con roles claros para el odontólogo y el equipo de recepción.
            Todo el historial de un paciente —agenda, odontograma y cobros— queda conectado, sin planillas sueltas ni
            Excel duplicados.
          </p>
          <Link to="/registro" className="text-brand-primary font-medium hover:text-brand-primary-dark">
            Crear mi consultorio →
          </Link>
        </div>
      </section>

      {/* Brand positioning */}
      <section id="marca" className="bg-white border-y border-surface-border">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
              <IconHeart className="w-6 h-6 text-brand-primary-dark" />
            </div>
            <h3 className="font-semibold text-ink mb-2">Cuidado humano</h3>
            <p className="text-sm text-slate-500">
              Diseñado para que la tecnología simplifique la operación sin perder el trato cercano con cada paciente.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-tech/10 flex items-center justify-center mb-4">
              <IconBolt className="w-6 h-6 text-brand-tech" />
            </div>
            <h3 className="font-semibold text-ink mb-2">Tecnología clara</h3>
            <p className="text-sm text-slate-500">
              En la nube, accesible desde cualquier dispositivo, con una interfaz simple sin curva de aprendizaje.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
              <IconShield className="w-6 h-6 text-brand-primary-dark" />
            </div>
            <h3 className="font-semibold text-ink mb-2">Datos aislados y seguros</h3>
            <p className="text-sm text-slate-500">
              Cada consultorio ve únicamente su propia información, con roles claros para todo el equipo.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold text-ink mb-4">Empieza a organizar tu consultorio hoy</h2>
        <p className="text-slate-500 mb-8">Crea tu cuenta y configura tu consultorio en menos de dos minutos.</p>
        <Link
          to="/registro"
          className="inline-block bg-brand-primary hover:bg-brand-primary-dark text-white font-medium rounded-control px-8 py-3"
        >
          Crear cuenta gratis
        </Link>
      </section>

      <footer className="border-t border-surface-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoWordmark} alt="MayaOS" className="h-5 w-auto opacity-80" />
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} MayaOS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

/**
 * Renders a photo from /public/brand/. Until the real file is dropped in place,
 * it fails silently (hides its own wrapper) instead of showing a broken-image icon.
 */
function ShowcasePhoto({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        const el = e.currentTarget
        el.style.display = 'none'
      }}
    />
  )
}

function HeroMockup() {
  return (
    <div className="bg-white rounded-card border border-surface-border shadow-sm p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-surface-muted" />
        <span className="w-2.5 h-2.5 rounded-full bg-surface-muted" />
        <span className="w-2.5 h-2.5 rounded-full bg-surface-muted" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1 space-y-2">
          <div className="h-3 w-3/4 rounded bg-brand-primary/20" />
          <div className="h-2 w-full rounded bg-surface-muted" />
          <div className="h-2 w-full rounded bg-surface-muted" />
          <div className="h-2 w-2/3 rounded bg-surface-muted" />
        </div>
        <div className="col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-ink/10" />
            <div className="h-5 w-16 rounded-control bg-brand-primary" />
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 rounded-sm ${i === 10 ? 'bg-brand-primary' : i % 6 === 0 ? 'bg-brand-tech/30' : 'bg-surface-muted'}`}
              />
            ))}
          </div>
          <div className="flex gap-1 pt-1">
            {['#EF4444', '#3B82F6', '#F59E0B', '#14B8A6', '#7C3AED'].map((c) => (
              <span key={c} className="w-4 h-5 rounded-sm border border-surface-border" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.5-4 4.5-6 7.5-6s6 2 7.5 6" strokeLinecap="round" />
    </svg>
  )
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v3M16 3v3" strokeLinecap="round" />
    </svg>
  )
}

function IconTooth({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M4 12h16M12 4v16" strokeLinecap="round" />
    </svg>
  )
}

function IconTag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M11 4h6a2 2 0 0 1 2 2v6l-8.5 8.5a1.5 1.5 0 0 1-2 0L4 16a1.5 1.5 0 0 1 0-2z" />
      <circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconCard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M6 14h5" strokeLinecap="round" />
    </svg>
  )
}

function IconCash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="2.5" y="7" width="19" height="10" rx="2" />
      <circle cx="12" cy="12" r="2.3" />
    </svg>
  )
}

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="3" width="10" height="18" rx="1" />
      <rect x="14" y="9" width="6" height="12" rx="1" />
      <path d="M7 7h1M10 7h1M7 11h1M10 11h1M7 15h1M10 15h1" strokeLinecap="round" />
    </svg>
  )
}

function IconPrinter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M6 9V4h12v5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" />
      <path d="M7 14h10v6H7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 20s-7-4.35-9.5-8.5C.8 8 2.5 4.5 6 4.5c2 0 3.5 1.2 6 3.7 2.5-2.5 4-3.7 6-3.7 3.5 0 5.2 3.5 3.5 7C19 15.65 12 20 12 20z" />
    </svg>
  )
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" strokeLinejoin="round" />
    </svg>
  )
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3 4.5 6v6c0 5 3.2 8.2 7.5 9 4.3-.8 7.5-4 7.5-9V6z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
