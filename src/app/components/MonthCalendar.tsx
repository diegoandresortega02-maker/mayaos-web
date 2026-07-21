const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

export function todayKey() {
  const now = new Date()
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate())
}

interface MonthCalendarProps {
  year: number
  month: number
  selectedDate: string
  appointmentDates: Set<string>
  onSelectDate: (date: string) => void
  onMonthChange: (year: number, month: number) => void
}

export default function MonthCalendar({
  year,
  month,
  selectedDate,
  appointmentDates,
  onSelectDate,
  onMonthChange,
}: MonthCalendarProps) {
  const firstOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // JS getDay(): Sun=0..Sat=6 -> convert to Mon=0..Sun=6
  const leading = (firstOfMonth.getDay() + 6) % 7
  const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7

  const today = todayKey()

  function handlePrevYear() {
    onMonthChange(year - 1, month)
  }
  function handleNextYear() {
    onMonthChange(year + 1, month)
  }
  function handleMonthSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    onMonthChange(year, Number(e.target.value))
  }

  return (
    <div className="bg-white rounded-card border border-surface-border p-4 w-64">
      <div className="flex items-center gap-3 mb-3">
        <div>
          <label className="block text-[11px] text-slate-500 mb-0.5">Mes</label>
          <select
            value={month}
            onChange={handleMonthSelect}
            className="text-sm rounded-control border border-surface-border px-2 py-1"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-0.5">Año</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevYear}
              className="w-5 h-5 flex items-center justify-center rounded bg-brand-primary/10 text-brand-primary-dark text-xs"
            >
              ‹
            </button>
            <span className="text-sm">{year}</span>
            <button
              type="button"
              onClick={handleNextYear}
              className="w-5 h-5 flex items-center justify-center rounded bg-brand-primary/10 text-brand-primary-dark text-xs"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="text-[11px] font-medium text-slate-500 pb-1">
            {label}
          </div>
        ))}
        {Array.from({ length: totalCells }).map((_, idx) => {
          const dayNum = idx - leading + 1
          if (dayNum < 1 || dayNum > daysInMonth) {
            return (
              <div key={idx} className="text-xs text-slate-300 py-1.5">
                –
              </div>
            )
          }
          const dateKey = toDateKey(year, month, dayNum)
          const isWeekend = idx % 7 >= 5
          const isSelected = dateKey === selectedDate
          const isToday = dateKey === today
          const hasAppointments = appointmentDates.has(dateKey)
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={`relative text-xs py-1.5 rounded transition ${
                isSelected
                  ? 'bg-brand-primary text-white font-semibold'
                  : isWeekend
                    ? 'text-brand-energy hover:bg-surface-muted'
                    : 'text-ink hover:bg-surface-muted'
              } ${isToday && !isSelected ? 'ring-1 ring-brand-primary' : ''}`}
            >
              {dayNum}
              {hasAppointments && (
                <span
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-brand-tech'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
