import { useEffect, useState } from 'react'
import { adminUpdateSiteContent, adminUploadSiteImage, getSiteContent } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'
import type {
  DemoCtaContent,
  FinalCtaContent,
  FounderContent,
  FoundingCtaContent,
  FooterContent,
  HeroContent,
  ShowcaseImagesContent,
  SiteContentMap,
  StepsContent,
  StoryContent,
} from '../../lib/types'

export default function AdminContenido() {
  const [content, setContent] = useState<SiteContentMap | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSiteContent()
      .then((c) => setContent(c as SiteContentMap))
      .catch((err) => setError(getErrorMessage(err, 'Error al cargar el contenido')))
  }, [])

  if (error) return <p className="p-8 text-sm text-red-600">{error}</p>
  if (!content) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Sitio web</h1>
          <p className="text-sm text-slate-500">Editá el texto y las imágenes de la landing pública.</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-sm text-brand-primary-dark font-medium hover:underline"
        >
          Ver la landing page →
        </a>
      </div>

      <HeroSection initial={content.hero} />
      <StepsSection initial={content.steps} />
      <ImagesSection initial={content.showcase_images} />
      <StorySection initial={content.story} />
      <FounderSection initial={content.founder} />
      <FoundingCtaSection initial={content.founding_cta} />
      <DemoCtaSection initial={content.demo_cta} />
      <FinalCtaSection initial={content.final_cta} />
      <FooterSection initial={content.footer} />
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-card border border-surface-border p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">{title}</h2>
      {children}
    </section>
  )
}

function SaveBar({ saving, saved, error, onSave }: { saving: boolean; saved: boolean; error: string | null; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <button
        onClick={onSave}
        disabled={saving}
        className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control px-4 py-2"
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
      {saved && <span className="text-sm text-emerald-600">Guardado.</span>}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}

const inputClass = 'w-full rounded-control border border-surface-border px-3 py-2 text-sm'
const labelClass = 'block text-xs font-medium text-slate-500 mb-1'

function useSectionSave<K extends keyof SiteContentMap>(key: K) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(value: SiteContentMap[K]) {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await adminUpdateSiteContent(key, value)
      setSaved(true)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al guardar'))
    } finally {
      setSaving(false)
    }
  }

  return { saving, saved, error, save }
}

function HeroSection({ initial }: { initial: HeroContent }) {
  const [v, setV] = useState(initial)
  const { saving, saved, error, save } = useSectionSave('hero')

  return (
    <Card title="Hero (portada)">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={labelClass}>Bajada (sobre el titular)</label>
          <input className={inputClass} value={v.eyebrow} onChange={(e) => setV({ ...v, eyebrow: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Titular — antes del acento</label>
          <input className={inputClass} value={v.headline_pre} onChange={(e) => setV({ ...v, headline_pre: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Titular — acento (en color)</label>
          <input
            className={inputClass}
            value={v.headline_accent}
            onChange={(e) => setV({ ...v, headline_accent: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Titular — después del acento</label>
          <input className={inputClass} value={v.headline_post} onChange={(e) => setV({ ...v, headline_post: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Subtítulo</label>
          <textarea
            className={inputClass}
            rows={2}
            value={v.subtext}
            onChange={(e) => setV({ ...v, subtext: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Botón principal</label>
          <input className={inputClass} value={v.cta_primary} onChange={(e) => setV({ ...v, cta_primary: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Botón secundario</label>
          <input
            className={inputClass}
            value={v.cta_secondary}
            onChange={(e) => setV({ ...v, cta_secondary: e.target.value })}
          />
        </div>
      </div>
      <SaveBar saving={saving} saved={saved} error={error} onSave={() => save(v)} />
    </Card>
  )
}

function StepsSection({ initial }: { initial: StepsContent }) {
  const [v, setV] = useState(initial)
  const { saving, saved, error, save } = useSectionSave('steps')

  function updateItem(i: number, patch: Partial<{ title: string; description: string }>) {
    const items = v.items.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    setV({ ...v, items })
  }

  return (
    <Card title="Cómo empezar (3 pasos)">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelClass}>Etiqueta de sección</label>
          <input className={inputClass} value={v.eyebrow} onChange={(e) => setV({ ...v, eyebrow: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Título de sección</label>
          <input className={inputClass} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </div>
      </div>
      <div className="space-y-3">
        {v.items.map((item, i) => (
          <div key={i} className="border border-surface-border rounded-control p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Paso {i + 1} — título</label>
              <input className={inputClass} value={item.title} onChange={(e) => updateItem(i, { title: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Paso {i + 1} — descripción</label>
              <input
                className={inputClass}
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
      <SaveBar saving={saving} saved={saved} error={error} onSave={() => save(v)} />
    </Card>
  )
}

function ImagesSection({ initial }: { initial: ShowcaseImagesContent }) {
  const [v, setV] = useState(initial)
  const { saved, error, save } = useSectionSave('showcase_images')
  const [uploading, setUploading] = useState<'consultorio' | 'equipo' | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleUpload(slot: 'consultorio' | 'equipo', file: File | undefined) {
    if (!file) return
    setUploading(slot)
    setUploadError(null)
    try {
      const url = await adminUploadSiteImage(file)
      const next = { ...v, [slot]: url }
      setV(next)
      await save(next)
    } catch (err) {
      console.error(err)
      setUploadError(getErrorMessage(err, 'Error al subir la imagen'))
    } finally {
      setUploading(null)
    }
  }

  return (
    <Card title="Fotos">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageSlot
          label="Foto del hero (consultorio)"
          src={v.consultorio}
          uploading={uploading === 'consultorio'}
          onChange={(f) => handleUpload('consultorio', f)}
        />
        <ImageSlot
          label="Foto de equipo"
          src={v.equipo}
          uploading={uploading === 'equipo'}
          onChange={(f) => handleUpload('equipo', f)}
        />
      </div>
      {uploadError && <p className="text-sm text-red-600 mt-3">{uploadError}</p>}
      {saved && !uploadError && <p className="text-sm text-emerald-600 mt-3">Guardado.</p>}
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </Card>
  )
}

function ImageSlot({
  label,
  src,
  uploading,
  onChange,
}: {
  label: string
  src: string
  uploading: boolean
  onChange: (file: File | undefined) => void
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="aspect-video rounded-control border border-surface-border bg-surface-muted overflow-hidden mb-2">
        <img src={src} alt={label} className="w-full h-full object-cover" />
      </div>
      <label className="inline-block bg-white border border-surface-border hover:bg-surface-muted text-ink text-xs font-medium rounded-control px-3 py-1.5 cursor-pointer">
        {uploading ? 'Subiendo…' : 'Cambiar foto'}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => onChange(e.target.files?.[0])}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}

function StorySection({ initial }: { initial: StoryContent }) {
  const [v, setV] = useState(initial)
  const { saving, saved, error, save } = useSectionSave('story')

  return (
    <Card title="Historia (junto a la foto de equipo)">
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Título</label>
          <input className={inputClass} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            className={inputClass}
            rows={3}
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Texto del link</label>
          <input className={inputClass} value={v.link_text} onChange={(e) => setV({ ...v, link_text: e.target.value })} />
        </div>
      </div>
      <SaveBar saving={saving} saved={saved} error={error} onSave={() => save(v)} />
    </Card>
  )
}

function FounderSection({ initial }: { initial: FounderContent }) {
  const [v, setV] = useState(initial)
  const { saving, saved, error, save } = useSectionSave('founder')

  return (
    <Card title="Nota del fundador">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={labelClass}>Cita</label>
          <textarea
            className={inputClass}
            rows={3}
            value={v.quote}
            onChange={(e) => setV({ ...v, quote: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Nombre</label>
          <input className={inputClass} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Rol</label>
          <input className={inputClass} value={v.role} onChange={(e) => setV({ ...v, role: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Iniciales (avatar)</label>
          <input
            className={inputClass}
            maxLength={3}
            value={v.initials}
            onChange={(e) => setV({ ...v, initials: e.target.value })}
          />
        </div>
      </div>
      <SaveBar saving={saving} saved={saved} error={error} onSave={() => save(v)} />
    </Card>
  )
}

function FoundingCtaSection({ initial }: { initial: FoundingCtaContent }) {
  const [v, setV] = useState(initial)
  const { saving, saved, error, save } = useSectionSave('founding_cta')

  return (
    <Card title="Bloque «consultorio fundador»">
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Etiqueta</label>
          <input className={inputClass} value={v.eyebrow} onChange={(e) => setV({ ...v, eyebrow: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Título</label>
          <input className={inputClass} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            className={inputClass}
            rows={3}
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Texto del botón</label>
          <input className={inputClass} value={v.button} onChange={(e) => setV({ ...v, button: e.target.value })} />
        </div>
      </div>
      <SaveBar saving={saving} saved={saved} error={error} onSave={() => save(v)} />
    </Card>
  )
}

function DemoCtaSection({ initial }: { initial: DemoCtaContent }) {
  const [v, setV] = useState(initial)
  const { saving, saved, error, save } = useSectionSave('demo_cta')

  return (
    <Card title="Prueba gratis asistida (WhatsApp)">
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Antetítulo</label>
          <input className={inputClass} value={v.eyebrow} onChange={(e) => setV({ ...v, eyebrow: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Título</label>
          <input className={inputClass} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            rows={3}
            className={inputClass}
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Texto del botón</label>
          <input className={inputClass} value={v.button} onChange={(e) => setV({ ...v, button: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Número de WhatsApp que recibe las solicitudes</label>
          <input className={inputClass} value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
          <p className="text-xs text-slate-400 mt-1">
            Con código de país y sin espacios, por ejemplo 59176055763. Si ponés 8 dígitos se le agrega 591 solo.
          </p>
        </div>
        <div>
          <label className={labelClass}>Mensaje que el visitante envía</label>
          <textarea
            rows={2}
            className={inputClass}
            value={v.message}
            onChange={(e) => setV({ ...v, message: e.target.value })}
          />
          <p className="text-xs text-slate-400 mt-1">
            Llega escrito en tu WhatsApp. Conviene que diga que viene de la web, así lo identificás al toque.
          </p>
        </div>
      </div>
      <SaveBar saving={saving} saved={saved} error={error} onSave={() => save(v)} />
    </Card>
  )
}

function FinalCtaSection({ initial }: { initial: FinalCtaContent }) {
  const [v, setV] = useState(initial)
  const { saving, saved, error, save } = useSectionSave('final_cta')

  return (
    <Card title="CTA final">
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Título</label>
          <input className={inputClass} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Descripción</label>
          <input
            className={inputClass}
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Texto del botón</label>
          <input className={inputClass} value={v.button} onChange={(e) => setV({ ...v, button: e.target.value })} />
        </div>
      </div>
      <SaveBar saving={saving} saved={saved} error={error} onSave={() => save(v)} />
    </Card>
  )
}

function FooterSection({ initial }: { initial: FooterContent }) {
  const [credit, setCredit] = useState(initial.credit)
  const [taglinesText, setTaglinesText] = useState(initial.taglines.join('\n'))
  const { saving, saved, error, save } = useSectionSave('footer')

  function handleSave() {
    const taglines = taglinesText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
    save({ credit, taglines })
  }

  return (
    <Card title="Footer">
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Texto de crédito</label>
          <input className={inputClass} value={credit} onChange={(e) => setCredit(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Frases del marquee (una por línea)</label>
          <textarea
            className={inputClass}
            rows={5}
            value={taglinesText}
            onChange={(e) => setTaglinesText(e.target.value)}
          />
        </div>
      </div>
      <SaveBar saving={saving} saved={saved} error={error} onSave={handleSave} />
    </Card>
  )
}
