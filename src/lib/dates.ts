// Days until the next occurrence of a birth_date's month/day, ignoring the year.
// Returns null when there's no birth_date to compute from.
export function daysUntilBirthday(birthDate: string | null): number | null {
  if (!birthDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const birth = new Date(birthDate)
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate())
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
