const UNITS = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
const TWENTIES = [
  'veinte',
  'veintiún',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
]
const TENS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const HUNDREDS = [
  '',
  'ciento',
  'doscientos',
  'trescientos',
  'cuatrocientos',
  'quinientos',
  'seiscientos',
  'setecientos',
  'ochocientos',
  'novecientos',
]

function twoDigitsToWords(n: number): string {
  if (n < 10) return UNITS[n]
  if (n < 20) return TEENS[n - 10]
  if (n < 30) return TWENTIES[n - 20]
  const tens = Math.floor(n / 10)
  const units = n % 10
  return units === 0 ? TENS[tens] : `${TENS[tens]} y ${UNITS[units]}`
}

function threeDigitsToWords(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cien'
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  return [hundreds > 0 ? HUNDREDS[hundreds] : '', twoDigitsToWords(rest)].filter(Boolean).join(' ')
}

function integerToWords(n: number): string {
  if (n === 0) return 'cero'
  const millions = Math.floor(n / 1_000_000)
  const thousands = Math.floor((n % 1_000_000) / 1000)
  const rest = n % 1000

  const parts: string[] = []
  if (millions > 0) parts.push(millions === 1 ? 'un millón' : `${integerToWords(millions)} millones`)
  if (thousands > 0) parts.push(thousands === 1 ? 'mil' : `${threeDigitsToWords(thousands)} mil`)
  if (rest > 0) parts.push(threeDigitsToWords(rest))
  return parts.join(' ')
}

/** e.g. 1250.5 -> "Mil doscientos cincuenta 50/100 Bolivianos" */
export function amountToWordsBs(amount: number): string {
  const rounded = Math.round(Math.max(amount, 0) * 100) / 100
  const intPart = Math.floor(rounded)
  const cents = Math.round((rounded - intPart) * 100)
  const centsStr = String(cents).padStart(2, '0')

  const words = integerToWords(intPart)
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1)
  const currency = intPart === 1 ? 'Boliviano' : 'Bolivianos'
  return `${capitalized} ${centsStr}/100 ${currency}`
}
