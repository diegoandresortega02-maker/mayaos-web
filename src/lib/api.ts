import { supabase } from './supabaseClient'
import type {
  Appointment,
  AppointmentStatus,
  BillingItem,
  BillingStatus,
  CashRegisterEntry,
  Clinic,
  ClinicRole,
  ClinicUser,
  ClinicalRecord,
  OdontogramTooth,
  Patient,
  PaymentRequest,
  PlanCode,
  Proforma,
  SubscriptionPlan,
  Treatment,
} from './types'

// ---------- Clinic staff ----------

export async function getMyClinic(): Promise<Clinic> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data, error } = await supabase.from('clinics').select('*').eq('id', clinicId).single()
  if (error) throw error
  return data
}

export async function getClinicStaff(): Promise<ClinicUser[]> {
  const { data, error } = await supabase.from('clinic_users').select('*').order('created_at')
  if (error) throw error
  return data
}

export async function updateStaffRole(userId: string, role: ClinicRole) {
  const { error } = await supabase.from('clinic_users').update({ role }).eq('id', userId)
  if (error) throw error
}

export async function removeStaff(userId: string) {
  const { error } = await supabase.from('clinic_users').delete().eq('id', userId)
  if (error) throw error
}

// ---------- Patients ----------

export type PatientInput = Omit<Patient, 'id' | 'clinic_id' | 'created_at'>

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase.from('patients').select('*').order('full_name')
  if (error) throw error
  return data
}

export async function getPatient(id: string): Promise<Patient> {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createPatient(input: PatientInput): Promise<Patient> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data, error } = await supabase
    .from('patients')
    .insert({ ...input, clinic_id: clinicId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePatient(id: string, input: Partial<PatientInput>): Promise<Patient> {
  const { data, error } = await supabase.from('patients').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deletePatient(id: string) {
  const { error } = await supabase.from('patients').delete().eq('id', id)
  if (error) throw error
}

async function getMyClinicIdOrThrow(): Promise<string> {
  const { data, error } = await supabase.rpc('get_my_clinic_id')
  if (error) throw error
  if (!data) throw new Error('El usuario no pertenece a ningún consultorio')
  return data
}

// ---------- Appointments (agenda) ----------

export type AppointmentInput = {
  patient_id: string
  appointment_date: string
  appointment_time: string
  details?: string | null
  status?: AppointmentStatus
}

export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(full_name)')
    .order('appointment_date')
    .order('appointment_time')
  if (error) throw error
  return data as unknown as Appointment[]
}

export async function createAppointment(input: AppointmentInput): Promise<Appointment> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...input, clinic_id: clinicId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAppointment(id: string, input: Partial<AppointmentInput>): Promise<Appointment> {
  const { data, error } = await supabase.from('appointments').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
}

// ---------- Treatments catalog ----------

export type TreatmentInput = { name: string; cost: number }

export async function getTreatments(): Promise<Treatment[]> {
  const { data, error } = await supabase.from('treatments_catalog').select('*').order('name')
  if (error) throw error
  return data
}

export async function createTreatment(input: TreatmentInput): Promise<Treatment> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data, error } = await supabase
    .from('treatments_catalog')
    .insert({ ...input, clinic_id: clinicId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTreatment(id: string, input: Partial<TreatmentInput>): Promise<Treatment> {
  const { data, error } = await supabase.from('treatments_catalog').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteTreatment(id: string) {
  const { error } = await supabase.from('treatments_catalog').delete().eq('id', id)
  if (error) throw error
}

// ---------- Clinical records + odontogram ----------

export type ClinicalRecordInput = {
  patient_id: string
  visit_date: string
  motivo_consulta?: string | null
  observaciones_generales?: string | null
}

export async function getClinicalRecords(patientId: string): Promise<ClinicalRecord[]> {
  const { data, error } = await supabase
    .from('clinical_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false })
  if (error) throw error
  return data
}

export async function getClinicalRecord(id: string): Promise<ClinicalRecord> {
  const { data, error } = await supabase.from('clinical_records').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createClinicalRecord(input: ClinicalRecordInput): Promise<ClinicalRecord> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('clinical_records')
    .insert({ ...input, clinic_id: clinicId, created_by: userData.user?.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClinicalRecord(id: string, input: Partial<ClinicalRecordInput>): Promise<ClinicalRecord> {
  const { data, error } = await supabase.from('clinical_records').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function getOdontogramTeeth(clinicalRecordId: string): Promise<OdontogramTooth[]> {
  const { data, error } = await supabase
    .from('odontogram_teeth')
    .select('*')
    .eq('clinical_record_id', clinicalRecordId)
  if (error) throw error
  return data
}

export type ToothSurfaceUpdate = Partial<
  Pick<
    OdontogramTooth,
    | 'surface_izquierda'
    | 'surface_medio'
    | 'surface_derecho'
    | 'surface_arriba'
    | 'surface_abajo'
    | 'color'
    | 'notes'
    | 'evolution'
  >
>

export async function upsertToothState(
  clinicalRecordId: string,
  toothNumber: number,
  update: ToothSurfaceUpdate,
): Promise<OdontogramTooth> {
  const { data, error } = await supabase
    .from('odontogram_teeth')
    .upsert(
      { clinical_record_id: clinicalRecordId, tooth_number: toothNumber, ...update },
      { onConflict: 'clinical_record_id,tooth_number' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// ---------- Billing / cobros ----------

export type BillingItemInput = {
  patient_id: string
  clinical_record_id?: string | null
  treatment_id?: string | null
  treatment_name: string
  quantity: number
  unit_price: number
  paid_amount?: number
  status?: BillingStatus
  visit_date?: string
}

export async function getBillingItems(patientId: string): Promise<BillingItem[]> {
  const { data, error } = await supabase
    .from('billing_items')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createBillingItem(input: BillingItemInput): Promise<BillingItem> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data, error } = await supabase
    .from('billing_items')
    .insert({ ...input, clinic_id: clinicId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBillingItem(id: string, input: Partial<BillingItemInput>): Promise<BillingItem> {
  const { data, error } = await supabase.from('billing_items').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteBillingItem(id: string) {
  const { error } = await supabase.from('billing_items').delete().eq('id', id)
  if (error) throw error
}

// ---------- Proformas (cotizaciones) ----------

export type ProformaItemInput = {
  treatment_id: string
  treatment_name: string
  quantity: number
  unit_price: number
}

export async function getProformas(patientId: string): Promise<Proforma[]> {
  const { data, error } = await supabase
    .from('proformas')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProforma(id: string): Promise<Proforma> {
  const { data, error } = await supabase.from('proformas').select('*, proforma_items(*)').eq('id', id).single()
  if (error) throw error
  return data as unknown as Proforma
}

export async function createProforma(
  patientId: string,
  items: ProformaItemInput[],
  discountBs: number,
): Promise<Proforma> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data: userData } = await supabase.auth.getUser()
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const total = Math.max(0, subtotal - discountBs)

  const { data: proforma, error } = await supabase
    .from('proformas')
    .insert({
      patient_id: patientId,
      clinic_id: clinicId,
      discount_bs: discountBs,
      subtotal,
      total,
      created_by: userData.user?.id,
    })
    .select()
    .single()
  if (error) throw error

  const { error: itemsError } = await supabase.from('proforma_items').insert(
    items.map((i) => ({
      proforma_id: proforma.id,
      treatment_id: i.treatment_id,
      treatment_name: i.treatment_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
    })),
  )
  if (itemsError) throw itemsError

  return proforma
}

export async function deleteProforma(id: string) {
  const { error } = await supabase.from('proformas').delete().eq('id', id)
  if (error) throw error
}

// ---------- Cash register (arqueo de caja diaria) ----------

export type CashRegisterInput = {
  register_date: string
  opening_balance: number
  cash_in: number
  cash_out: number
  closing_balance: number
  notes?: string | null
}

export async function getCashRegisterEntries(): Promise<CashRegisterEntry[]> {
  const { data, error } = await supabase
    .from('cash_register')
    .select('*')
    .order('register_date', { ascending: false })
  if (error) throw error
  return data
}

export async function upsertCashRegisterEntry(input: CashRegisterInput): Promise<CashRegisterEntry> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('cash_register')
    .upsert(
      { ...input, clinic_id: clinicId, created_by: userData.user?.id },
      { onConflict: 'clinic_id,register_date' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// ---------- Membresía / suscripción (consultorio) ----------

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase.from('subscription_plans').select('*').order('duration_months')
  if (error) throw error
  return data
}

export async function getMyPaymentRequests(): Promise<PaymentRequest[]> {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*, subscription_plans(name, duration_months)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as PaymentRequest[]
}

export async function uploadPaymentProof(file: File): Promise<string> {
  const clinicId = await getMyClinicIdOrThrow()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${clinicId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('payment-proofs').upload(path, file)
  if (error) throw error
  return path
}

export async function createPaymentRequest(planCode: PlanCode, amountBs: number, proofStoragePath: string): Promise<PaymentRequest> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('payment_requests')
    .insert({
      clinic_id: clinicId,
      plan_code: planCode,
      amount_bs: amountBs,
      proof_storage_path: proofStoragePath,
      requested_by: userData.user?.id,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ---------- Panel admin (platform admin) ----------

export async function adminGetPendingPaymentRequests(): Promise<PaymentRequest[]> {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*, clinics(name), subscription_plans(name, duration_months)')
    .eq('status', 'pending')
    .order('created_at')
  if (error) throw error
  return data as unknown as PaymentRequest[]
}

export async function adminGetPaymentRequestHistory(): Promise<PaymentRequest[]> {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*, clinics(name), subscription_plans(name, duration_months)')
    .neq('status', 'pending')
    .order('reviewed_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data as unknown as PaymentRequest[]
}

export async function adminGetProofUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 60 * 10)
  if (error) throw error
  return data.signedUrl
}

export async function adminApprovePaymentRequest(request: PaymentRequest, durationMonths: number): Promise<void> {
  const { error: reqError } = await supabase
    .from('payment_requests')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', request.id)
  if (reqError) throw reqError

  const currentPeriodEnd = new Date()
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + durationMonths)

  const { error: clinicError } = await supabase
    .from('clinics')
    .update({
      subscription_status: 'active',
      current_plan_code: request.plan_code,
      current_period_end: currentPeriodEnd.toISOString(),
    })
    .eq('id', request.clinic_id)
  if (clinicError) throw clinicError
}

export async function adminRejectPaymentRequest(id: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('payment_requests')
    .update({ status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function adminGetClinics(): Promise<Clinic[]> {
  const { data, error } = await supabase.from('clinics').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}
