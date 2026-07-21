import { FDI_LOWER, FDI_UPPER, type OdontogramTooth } from '../../lib/types'

export type Surface = 'surface_arriba' | 'surface_abajo' | 'surface_izquierda' | 'surface_derecho' | 'surface_medio'

export const SURFACES: Surface[] = [
  'surface_arriba',
  'surface_izquierda',
  'surface_medio',
  'surface_derecho',
  'surface_abajo',
]

export interface ToothCondition {
  code: string
  number: number
  label: string
  color: string
}

// Mirrors the 16-code legend from the original Excel odontogram (código -> significado)
export const TOOTH_CONDITIONS: ToothCondition[] = [
  { code: '', number: 0, label: 'Sano', color: '#FFFFFF' },
  { code: 'caries', number: 1, label: 'Caries', color: '#EF4444' },
  { code: 'obturado', number: 2, label: 'Diente Obturado', color: '#3B82F6' },
  { code: 'ausente', number: 3, label: 'Ausente', color: '#7F1D1D' },
  { code: 'fractura', number: 4, label: 'Fractura', color: '#F59E0B' },
  { code: 'resina', number: 5, label: 'Resina', color: '#FDE047' },
  { code: 'amalgama', number: 6, label: 'Amalgama', color: '#86EFAC' },
  { code: 'erosion', number: 7, label: 'Erosión', color: '#15803D' },
  { code: 'obturacion', number: 8, label: 'Obturación', color: '#38BDF8' },
  { code: 'sellante', number: 9, label: 'Sellante', color: '#14B8A6' },
  { code: 'enfermedad_periodontal', number: 10, label: 'Enfermedad Periodontal', color: '#7C3AED' },
  { code: 'mal_posicion', number: 11, label: 'Mal Posición dentaria', color: '#6B7280' },
  { code: 'exodoncia', number: 12, label: 'Exodoncia', color: '#334155' },
  { code: 'corona', number: 13, label: 'Corona', color: '#CBD5E1' },
  { code: 'protesis', number: 14, label: 'Prótesis', color: '#FDBA74' },
  { code: 'mancha_blanca', number: 15, label: 'Mancha Blanca', color: '#A16207' },
  { code: 'otro', number: 16, label: 'Otro', color: '#4F46E5' },
]

const CONDITION_BY_CODE: Record<string, ToothCondition> = Object.fromEntries(
  TOOTH_CONDITIONS.map((c) => [c.code, c]),
)

export function conditionOf(code: string | null | undefined): ToothCondition {
  return CONDITION_BY_CODE[code || ''] ?? CONDITION_BY_CODE['']
}

// Clinical severity order (most urgent first) used to pick the tooth's overall/summary color
const SEVERITY_ORDER = [
  'exodoncia',
  'ausente',
  'enfermedad_periodontal',
  'fractura',
  'caries',
  'erosion',
  'mancha_blanca',
  'mal_posicion',
  'obturado',
  'obturacion',
  'resina',
  'amalgama',
  'sellante',
  'corona',
  'protesis',
  'otro',
  '',
]

export function worstCondition(tooth: Partial<OdontogramTooth> | undefined): string {
  if (!tooth) return ''
  const values = SURFACES.map((s) => tooth[s] || '')
  for (const code of SEVERITY_ORDER) {
    if (code !== '' && values.includes(code)) return code
  }
  return ''
}

interface OdontogramProps {
  teethByNumber: Record<number, OdontogramTooth | undefined>
  selectedTooth?: number | null
  onSelectTooth?: (toothNumber: number) => void
  readOnly?: boolean
}

export default function Odontogram({ teethByNumber, selectedTooth, onSelectTooth, readOnly }: OdontogramProps) {
  return (
    <div className="space-y-5">
      <ToothRow numbers={FDI_UPPER} teethByNumber={teethByNumber} selectedTooth={selectedTooth} onSelectTooth={onSelectTooth} readOnly={readOnly} />
      <ToothRow numbers={FDI_LOWER} teethByNumber={teethByNumber} selectedTooth={selectedTooth} onSelectTooth={onSelectTooth} readOnly={readOnly} />
      <Legend />
    </div>
  )
}

function ToothRow({
  numbers,
  teethByNumber,
  selectedTooth,
  onSelectTooth,
  readOnly,
}: {
  numbers: number[]
  teethByNumber: Record<number, OdontogramTooth | undefined>
  selectedTooth?: number | null
  onSelectTooth?: (toothNumber: number) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-nowrap gap-0.5 justify-center overflow-x-auto">
      {numbers.map((n) => (
        <Tooth
          key={n}
          number={n}
          tooth={teethByNumber[n]}
          selected={selectedTooth === n}
          onSelect={onSelectTooth}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}

function Tooth({
  number,
  tooth,
  selected,
  onSelect,
  readOnly,
}: {
  number: number
  tooth: OdontogramTooth | undefined
  selected?: boolean
  onSelect?: (toothNumber: number) => void
  readOnly?: boolean
}) {
  const worst = conditionOf(worstCondition(tooth))

  function swatch(surface: Surface) {
    const c = conditionOf(tooth?.[surface])
    return <div style={{ backgroundColor: c.color }} className="w-full h-full border border-surface-border" />
  }

  return (
    <button
      type="button"
      disabled={readOnly}
      onClick={() => onSelect?.(number)}
      className={`flex flex-col items-center gap-1 rounded-card p-1 shrink-0 transition disabled:cursor-default ${
        selected ? 'bg-brand-primary/10 ring-2 ring-brand-primary' : 'hover:bg-surface-muted'
      }`}
    >
      <span className="text-[10px] font-medium text-slate-500">{number}</span>
      <div className="relative">
        {/* Stylized tooth silhouette: rounded crown + tapered root */}
        <div
          className="w-8 h-10 border border-surface-border"
          style={{
            borderRadius: '40% 40% 30% 30% / 45% 45% 25% 25%',
            backgroundColor: worst.color === '#FFFFFF' ? '#F8FAFC' : worst.color,
          }}
        />
        <div className="absolute inset-1 grid grid-cols-3 grid-rows-3 gap-px overflow-hidden rounded opacity-90">
          <div />
          {swatch('surface_arriba')}
          <div />
          {swatch('surface_izquierda')}
          {swatch('surface_medio')}
          {swatch('surface_derecho')}
          <div />
          {swatch('surface_abajo')}
          <div />
        </div>
        {worst.number > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white border border-white"
            style={{ backgroundColor: worst.color }}
          >
            {worst.number}
          </span>
        )}
      </div>
    </button>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center pt-3 border-t border-slate-100">
      {TOOTH_CONDITIONS.map((c) => (
        <div key={c.code} className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white border border-surface-border"
            style={{ backgroundColor: c.color, color: c.number === 0 ? '#94a3b8' : undefined }}
          >
            {c.number}
          </span>
          <span className="text-xs text-slate-500">{c.label}</span>
        </div>
      ))}
    </div>
  )
}
