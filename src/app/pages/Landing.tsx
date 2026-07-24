import { useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import logoWordmark from '../../assets/brand/logo-wordmark.png'

const STEPS: { icon: (props: { className?: string }) => ReactElement; title: string; description: string }[] = [
  {
    icon: IconAccount,
    title: 'Creá tu cuenta',
    description: 'Registrás tu consultorio en menos de 2 minutos, sin tarjeta de crédito.',
  },
  {
    icon: IconTag,
    title: 'Cargá tus pacientes',
    description: 'Agregás tus primeros pacientes y tratamientos, a tu ritmo.',
  },
  {
    icon: IconCheck,
    title: 'Atendé con MayaOS',
    description: 'Agenda, historia clínica y proformas, todo desde el mismo lugar.',
  },
]

type PanelKey = 'inicio' | 'pacientes' | 'agenda' | 'tratamientos' | 'caja' | 'equipo' | 'planes'

const PANELS: Record<PanelKey, { label: string; title: string; render: () => ReactElement }> = {
  inicio: {
    label: 'Inicio',
    title: 'Resumen del consultorio · Mes',
    render: () => (
      <>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <PreviewCard label="Citas" value="6" tone="primary" />
          <PreviewCard label="Tratamientos" value="6" tone="tech" />
          <PreviewCard label="Ingreso" value="Bs 430" tone="primary-dark" />
          <PreviewCard label="Proformas" value="6" tone="tech-strong" />
        </div>
        <div className="border-t border-surface-border pt-2 space-y-1">
          <PreviewRow left="J. Gómez" right="Programada" />
          <PreviewRow left="C. Vargas" right="Programada" />
          <PreviewRow left="S. Rojas" right="Programada" />
        </div>
      </>
    ),
  },
  pacientes: {
    label: 'Pacientes',
    title: 'Pacientes',
    render: () => (
      <div className="space-y-1">
        <PreviewRow left="Juan Gómez" right="CI 4521123" />
        <PreviewRow left="Cristhian Vargas" right="CI 8890211" />
        <PreviewRow left="Sofía Rojas" right="CI 9623523" />
        <PreviewRow left="Mauricio Pereira" right="CI 7712340" />
      </div>
    ),
  },
  agenda: {
    label: 'Agenda',
    title: 'Agenda · Semana',
    render: () => (
      <div className="space-y-1">
        <PreviewRow left="Lun 09:15 · J. Gómez" right="Programada" />
        <PreviewRow left="Mar 10:30 · C. Vargas" right="Programada" />
        <PreviewRow left="Jue 12:30 · D. Ortega" right="Completada" done />
      </div>
    ),
  },
  tratamientos: {
    label: 'Tratamientos',
    title: 'Catálogo de tratamientos',
    render: () => (
      <div className="space-y-1">
        <PreviewRow left="Limpieza dental" right="Bs 150" plain />
        <PreviewRow left="Restauración con resina" right="Bs 250" plain />
        <PreviewRow left="Carillas" right="Bs 800" plain />
        <PreviewRow left="Endodoncia" right="Bs 600" plain />
      </div>
    ),
  },
  caja: {
    label: 'Caja diaria',
    title: 'Caja diaria · Hoy',
    render: () => (
      <>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <PreviewCard label="Ingresos" value="Bs 350" tone="primary" />
          <PreviewCard label="Egresos" value="Bs 40" tone="primary-dark" />
        </div>
        <div className="border-t border-surface-border pt-2">
          <PreviewRow left="Saldo del día" right="Bs 310" plain bold />
        </div>
      </>
    ),
  },
  equipo: {
    label: 'Equipo',
    title: 'Equipo',
    render: () => (
      <div className="space-y-1">
        <PreviewRow left="Dra. Ana Pérez" right="Dueño/a" />
        <PreviewRow left="Asistente Carla" right="Odontólogo/a" />
        <PreviewRow left="Código de invitación" right="797d3dca" />
      </div>
    ),
  },
  planes: {
    label: 'Planes',
    title: 'Planes',
    render: () => (
      <div className="space-y-1">
        <PreviewRow left="Mensual" right="Bs 85" plain />
        <PreviewRow left="Semestral" right="Bs 450" />
        <PreviewRow left="Anual" right="Bs 850" plain />
        <PreviewRow left="+1 usuario extra" right="Bs 30" plain />
      </div>
    ),
  },
}

const FOOTER_TAGLINES = [
  'Historia clínica digital',
  'Sin papeleo',
  'Agenda inteligente',
  'Proformas en segundos',
  'Datos aislados y seguros',
]

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
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-56 -left-44 w-[480px] h-[480px] rounded-full blur-[70px] bg-brand-primary/[0.26] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-40 w-[420px] h-[420px] rounded-full blur-[70px] bg-brand-tech/[0.20] pointer-events-none"
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brand-primary-dark text-sm font-semibold mb-3">Software para consultorios odontológicos</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-ink leading-tight mb-5">
              Menos papeleo, <span className="text-brand-primary">más consultorio</span> bajo control
            </h1>
            <p className="text-slate-500 text-lg mb-8 max-w-md">
              Pacientes, agenda, historia clínica y proformas en un solo lugar — sin cuadernos, sin Excel, sin buscar
              papeles sueltos.
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

          <ProductPreview />
        </div>
      </section>

      {/* Cómo empezar */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-brand-primary/5 rounded-card p-8 md:p-10">
          <p className="text-brand-tech text-xs font-bold tracking-wide uppercase mb-2">Cómo empezar</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-10 max-w-xl">
            De cuadernos a MayaOS en tres pasos
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.title}>
                <div className="w-13 h-13 rounded-control bg-brand-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-brand-primary-dark" />
                </div>
                <h3 className="font-semibold text-ink mb-1">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
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

      {/* Founder note + founding member */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row gap-6 items-start bg-white rounded-card border border-surface-border p-7">
          <div className="w-13 h-13 rounded-full bg-brand-primary text-white font-semibold text-sm flex items-center justify-center shrink-0">
            DO
          </div>
          <div>
            <p className="text-ink text-lg leading-relaxed italic mb-3">
              "Empecé con una plantilla de Excel para consultorios odontológicos y vi de cerca cuánto tiempo se perdía
              en papeleo y hojas sueltas. MayaOS nace de esa misma necesidad: un sistema simple, pensado desde cero
              para consultorios bolivianos."
            </p>
            <p className="text-sm font-semibold text-ink">Diego Ortega</p>
            <p className="text-sm text-slate-500">CEO de MayaOS</p>
          </div>
        </div>

        <div className="mt-10 text-center bg-brand-tech/[0.06] border border-brand-tech/20 rounded-card px-6 py-10">
          <p className="text-brand-tech text-xs font-bold tracking-wide uppercase mb-2">Primeros consultorios</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-4">Sumate como consultorio fundador</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            MayaOS recién está empezando. Como consultorio fundador tenés atención directa nuestra mientras
            construimos el sistema, y ayudás a definir qué se construye después.
          </p>
          <Link
            to="/registro"
            className="inline-block bg-brand-primary hover:bg-brand-primary-dark text-white font-medium rounded-control px-6 py-3"
          >
            Quiero ser consultorio fundador
          </Link>
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
        <div className="overflow-hidden border-b border-surface-border bg-surface-muted py-3.5">
          <div className="flex w-max gap-12 animate-footer-marquee" style={{ animation: 'footer-marquee 42s linear infinite' }}>
            {[0, 1].map((rep) => (
              <div key={rep} className="flex gap-12 shrink-0">
                {FOOTER_TAGLINES.map((t) => (
                  <span
                    key={t}
                    className="whitespace-nowrap text-xs font-bold tracking-wide uppercase text-slate-500 flex items-center gap-3"
                  >
                    {t}
                    <span className="text-brand-primary">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoWordmark} alt="MayaOS" className="h-5 w-auto opacity-80" />
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <a href="https://wa.me/59176055763" target="_blank" rel="noreferrer" className="hover:text-slate-600">
              +591 76055763
            </a>
            <a href="mailto:diegoandresortega02@gmail.com" className="hover:text-slate-600">
              diegoandresortega02@gmail.com
            </a>
            <Link to="/terminos" className="hover:text-slate-600">
              Términos y Condiciones
            </Link>
            <Link to="/privacidad" className="hover:text-slate-600">
              Privacidad
            </Link>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-surface-muted border border-surface-border rounded-full px-4 py-2">
            Hecho con <span className="text-brand-energy">❤️</span> para odontólogos bolivianos
          </span>
          <MagneticBackToTop />
        </div>
        <p className="text-center text-xs text-slate-400 pb-6">
          © {new Date().getFullYear()} MayaOS. Todos los derechos reservados.
        </p>
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

function ProductPreview() {
  const [active, setActive] = useState<PanelKey>('inicio')
  const [switching, setSwitching] = useState(false)

  function selectPanel(key: PanelKey) {
    if (switching || key === active) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setSwitching(true)
    window.setTimeout(
      () => {
        setActive(key)
        setSwitching(false)
      },
      reduce ? 0 : 180,
    )
  }

  return (
    <div className="bg-white rounded-card border border-surface-border shadow-sm overflow-hidden" aria-hidden="true">
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-surface-muted border-b border-surface-border">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FEBC2E' }} />
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#28C840' }} />
      </div>
      <div className="flex text-[11px]">
        <nav className="w-24 shrink-0 py-3.5 px-2 border-r border-surface-border flex flex-col gap-0.5">
          {(Object.keys(PANELS) as PanelKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => selectPanel(key)}
              className={`text-left rounded-control px-2 py-1.5 transition-colors ${
                active === key
                  ? 'bg-brand-primary/10 text-brand-primary-dark font-semibold'
                  : 'text-slate-500 hover:bg-surface-muted'
              }`}
            >
              {PANELS[key].label}
            </button>
          ))}
        </nav>
        <div className="flex-1 min-w-0 p-4">
          <div
            className={`transition-all duration-200 ease-out ${switching ? 'opacity-0 translate-y-1.5' : 'opacity-100 translate-y-0'}`}
          >
            <h4 className="font-display font-bold text-[13px] text-ink mb-2.5">{PANELS[active].title}</h4>
            {PANELS[active].render()}
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'primary' | 'primary-dark' | 'tech' | 'tech-strong'
}) {
  const toneClass = {
    primary: 'bg-brand-primary/[0.16] text-brand-primary-dark',
    'primary-dark': 'bg-brand-primary-dark/[0.16] text-brand-primary-dark',
    tech: 'bg-brand-tech/[0.14] text-brand-tech',
    'tech-strong': 'bg-brand-tech/[0.22] text-brand-tech',
  }[tone]
  return (
    <div className={`rounded-control px-2.5 py-2 ${toneClass}`}>
      <div className="text-[10px] opacity-75">{label}</div>
      <div className="font-display font-bold text-[15px] mt-0.5">{value}</div>
    </div>
  )
}

function PreviewRow({
  left,
  right,
  plain,
  done,
  bold,
}: {
  left: string
  right: string
  plain?: boolean
  done?: boolean
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={bold ? 'text-ink font-bold' : 'text-ink'}>{left}</span>
      {plain ? (
        <span className={bold ? 'text-ink font-bold' : 'text-slate-500'}>{right}</span>
      ) : (
        <span
          className={`rounded-full px-1.5 py-px text-[9px] font-bold ${
            done ? 'bg-brand-primary-dark/15 text-brand-primary-dark' : 'bg-brand-primary/15 text-brand-primary-dark'
          }`}
        >
          {right}
        </span>
      )}
    </div>
  )
}

function MagneticBackToTop() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <button
      type="button"
      aria-label="Volver arriba"
      onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
      onMouseMove={(e) => {
        if (reduce) return
        const r = e.currentTarget.getBoundingClientRect()
        setOffset({ x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35 })
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      className="w-11 h-11 rounded-full border border-surface-border bg-surface-warm flex items-center justify-center text-slate-500 hover:border-brand-primary transition-[border-color] shrink-0"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5">
        <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function IconAccount({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M4 20c0-3.3 2.5-5.5 5.6-5.5" strokeLinecap="round" />
      <path d="M17 9v6M14 12h6" strokeLinecap="round" />
    </svg>
  )
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16M8 3v4M16 3v4" strokeLinecap="round" />
      <path d="M9 14.5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
