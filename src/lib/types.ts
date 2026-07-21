export type ClinicRole = 'owner' | 'dentist' | 'assistant'
export type SubscriptionStatus = 'trial' | 'active' | 'expired'
export type PlanCode = 'mensual' | 'semestral' | 'anual'
export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected'

export interface Clinic {
  id: string
  name: string
  address: string | null
  phone: string | null
  invite_code: string
  subscription_status: SubscriptionStatus
  trial_ends_at: string
  current_period_end: string | null
  current_plan_code: PlanCode | null
  created_at: string
}

export interface ClinicUser {
  id: string
  clinic_id: string
  first_name: string
  last_name: string
  phone: string | null
  address: string | null
  role: ClinicRole
  created_at: string
}

export interface SubscriptionPlan {
  code: PlanCode
  name: string
  price_bs: number
  duration_months: number
}

export interface PaymentRequest {
  id: string
  clinic_id: string
  plan_code: PlanCode
  amount_bs: number
  proof_storage_path: string
  status: PaymentRequestStatus
  rejection_reason: string | null
  requested_by: string | null
  reviewed_at: string | null
  created_at: string
  clinics?: { name: string }
  subscription_plans?: { name: string; duration_months: number }
}

export interface Patient {
  id: string
  clinic_id: string
  full_name: string
  age: number | null
  sex: 'M' | 'F' | 'Otro' | null
  address: string | null
  phone: string | null
  allergies: string | null
  identification: string | null
  titular_full_name: string | null
  titular_identification: string | null
  titular_phone: string | null
  titular_relationship: string | null
  sensitivity_frio: boolean | null
  sensitivity_calor: boolean | null
  sensitivity_dulce: boolean | null
  sensitivity_acido: boolean | null
  sensitivity_percusion: boolean | null
  sensitivity_sangrado: boolean | null
  clinical_history_started_at: string | null
  anamnesis_alergias: boolean | null
  anamnesis_cirugias: boolean | null
  anamnesis_medicamentos: boolean | null
  anamnesis_anestesia: boolean | null
  anamnesis_hemorragias: boolean | null
  anamnesis_diabetes: boolean | null
  anamnesis_hipertension: boolean | null
  anamnesis_fiebre_reumatica: boolean | null
  anamnesis_asma: boolean | null
  anamnesis_vih_sida: boolean | null
  anamnesis_cardiovascular: boolean | null
  anamnesis_gastrointestinal: boolean | null
  anamnesis_respiratoria: boolean | null
  anamnesis_embarazo: boolean | null
  anamnesis_enfermedad_grave_reciente: boolean | null
  anamnesis_alcohol: boolean | null
  anamnesis_tabaco: boolean | null
  anamnesis_detalle: string | null
  exam_molestias_dolor: boolean | null
  exam_mal_olor_sabor: boolean | null
  exam_sangrado_encias: boolean | null
  exam_dientes_moviles_bruxismo: boolean | null
  exam_malos_habitos_orofaciales: boolean | null
  exam_succiona_citricos: boolean | null
  exam_usa_otro_aditamento: boolean | null
  exam_fecha_ultima_visita: string | null
  exam_tratamientos_previos: string | null
  exam_cepillado_veces_dia: number | null
  exam_detalle: string | null
  created_at: string
}

export type AnamnesisKey =
  | 'anamnesis_alergias'
  | 'anamnesis_cirugias'
  | 'anamnesis_medicamentos'
  | 'anamnesis_anestesia'
  | 'anamnesis_hemorragias'
  | 'anamnesis_diabetes'
  | 'anamnesis_hipertension'
  | 'anamnesis_fiebre_reumatica'
  | 'anamnesis_asma'
  | 'anamnesis_vih_sida'
  | 'anamnesis_cardiovascular'
  | 'anamnesis_gastrointestinal'
  | 'anamnesis_respiratoria'
  | 'anamnesis_embarazo'
  | 'anamnesis_enfermedad_grave_reciente'
  | 'anamnesis_alcohol'
  | 'anamnesis_tabaco'

// Las 17 preguntas de anamnesis, en el orden de la ficha de referencia
export const ANAMNESIS_QUESTIONS: { key: AnamnesisKey; label: string }[] = [
  { key: 'anamnesis_alergias', label: '¿Es alérgico a alguna sustancia o medicamento?' },
  { key: 'anamnesis_cirugias', label: '¿Ha sido intervenido quirúrgicamente alguna vez?' },
  { key: 'anamnesis_medicamentos', label: '¿Consume algún medicamento?' },
  { key: 'anamnesis_anestesia', label: '¿Presenta problemas con la anestesia local o general?' },
  { key: 'anamnesis_hemorragias', label: '¿Padece hemorragia o sangrado?' },
  { key: 'anamnesis_diabetes', label: '¿Padece Diabetes Mellitus?' },
  { key: 'anamnesis_hipertension', label: '¿Padece Hipertensión Arterial?' },
  { key: 'anamnesis_fiebre_reumatica', label: '¿Padece Fiebre Reumática?' },
  { key: 'anamnesis_asma', label: '¿Padece Asma Bronquial?' },
  { key: 'anamnesis_vih_sida', label: '¿Padece V.I.H. / SIDA?' },
  { key: 'anamnesis_cardiovascular', label: '¿Padece enfermedades cardiovasculares?' },
  { key: 'anamnesis_gastrointestinal', label: '¿Padece enfermedades gastrointestinales?' },
  { key: 'anamnesis_respiratoria', label: '¿Padece enfermedades respiratorias?' },
  { key: 'anamnesis_embarazo', label: '¿Está embarazada?' },
  { key: 'anamnesis_enfermedad_grave_reciente', label: '¿Padece alguna enfermedad grave recientemente?' },
  { key: 'anamnesis_alcohol', label: '¿Consume alcohol?' },
  { key: 'anamnesis_tabaco', label: '¿Fuma?' },
]

export type ExamenBucalKey =
  | 'exam_molestias_dolor'
  | 'exam_mal_olor_sabor'
  | 'exam_sangrado_encias'
  | 'exam_dientes_moviles_bruxismo'
  | 'exam_malos_habitos_orofaciales'
  | 'exam_succiona_citricos'
  | 'exam_usa_otro_aditamento'

// Preguntas Sí/No del examen bucal/dental, en el orden de la ficha de referencia.
// exam_fecha_ultima_visita, exam_tratamientos_previos y exam_cepillado_veces_dia
// no son Sí/No y se editan con sus propios campos, no con este listado.
export const EXAMEN_BUCAL_QUESTIONS: { key: ExamenBucalKey; label: string }[] = [
  { key: 'exam_molestias_dolor', label: '¿Molestias o dolor bucal?' },
  { key: 'exam_mal_olor_sabor', label: '¿Mal olor o mal sabor bucal?' },
  { key: 'exam_sangrado_encias', label: '¿Le sangran las encías?' },
  { key: 'exam_dientes_moviles_bruxismo', label: '¿Siente sus dientes móviles, aprieta o rechina sus dientes?' },
  {
    key: 'exam_malos_habitos_orofaciales',
    label: '¿Malos hábitos orofaciales? (morder las uñas, chupar los dedos, morder el lápiz)',
  },
  { key: 'exam_succiona_citricos', label: '¿Succiona cítricos?' },
  { key: 'exam_usa_otro_aditamento', label: '¿Aparte del cepillo utiliza otro aditamento de limpieza?' },
]

export type AppointmentStatus = 'programada' | 'completada' | 'cancelada'

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  details: string | null
  status: AppointmentStatus
  created_at: string
  patients?: { full_name: string }
}

export interface Treatment {
  id: string
  clinic_id: string
  name: string
  cost: number
  created_at: string
}

export interface ClinicalRecord {
  id: string
  clinic_id: string
  patient_id: string
  visit_date: string
  motivo_consulta: string | null
  observaciones_generales: string | null
  created_by: string | null
  created_at: string
}

export interface OdontogramTooth {
  id: string
  clinical_record_id: string
  tooth_number: number
  surface_izquierda: string | null
  surface_medio: string | null
  surface_derecho: string | null
  surface_arriba: string | null
  surface_abajo: string | null
  color: string | null
  notes: string | null
  evolution: string | null
}

export type BillingStatus = 'pendiente' | 'pagado' | 'parcial'

export interface BillingItem {
  id: string
  clinic_id: string
  patient_id: string
  clinical_record_id: string | null
  treatment_id: string | null
  treatment_name: string
  quantity: number
  unit_price: number
  subtotal: number
  paid_amount: number
  status: BillingStatus
  visit_date: string
  created_at: string
}

export interface CashRegisterEntry {
  id: string
  clinic_id: string
  register_date: string
  opening_balance: number
  cash_in: number
  cash_out: number
  closing_balance: number
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface ProformaItem {
  id: string
  proforma_id: string
  treatment_id: string | null
  treatment_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Proforma {
  id: string
  clinic_id: string
  patient_id: string
  discount_bs: number
  subtotal: number
  total: number
  valid_until: string
  created_by: string | null
  created_at: string
  proforma_items?: ProformaItem[]
}

// FDI tooth numbering, upper then lower arch, as laid out in the original odontogram
export const FDI_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const FDI_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
