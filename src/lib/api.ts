import { supabase } from './supabaseClient'
import type {
  AdminClinicUser,
  Appointment,
  AppointmentStatus,
  BillingItem,
  BillingStatus,
  CashRegisterEntry,
  Clinic,
  ClinicRole,
  ClinicUser,
  ClinicalRecord,
  Consent,
  OdontogramTooth,
  OdontogramType,
  Patient,
  PaymentRequest,
  PlanCode,
  Proforma,
  PublicProformaDoc,
  PublicReceiptDoc,
  Receipt,
  SiteContentMap,
  SubscriptionPlan,
  Treatment,
  TrashItem,
} from './types'

// ---------- Clinic staff ----------

export async function getMyClinic(): Promise<Clinic> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data, error } = await supabase.from('clinics').select('*').eq('id', clinicId).single()
  if (error) throw error
  return data
}

export type ClinicProfileInput = Partial<Pick<Clinic, 'name' | 'address' | 'phone' | 'logo_url'>>

export async function updateMyClinic(input: ClinicProfileInput): Promise<Clinic> {
  const clinicId = await getMyClinicIdOrThrow()
  const { data, error } = await supabase.from('clinics').update(input).eq('id', clinicId).select().single()
  if (error) throw error
  return data
}

export async function uploadClinicLogo(file: File): Promise<string> {
  const clinicId = await getMyClinicIdOrThrow()
  const ext = file.name.split('.').pop() || 'png'
  // A unique path per upload (instead of a fixed logo.<ext> re-uploaded with
  // upsert) avoids Supabase Storage's upsert path, which requires satisfying
  // the UPDATE policy even for a brand-new object and fails RLS unexpectedly.
  const path = `${clinicId}/logo-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('clinic-logos').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('clinic-logos').getPublicUrl(path)
  return data.publicUrl
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

// full_name is the only field a caller must supply — everything else (sensitivity tests,
// anamnesis, examen bucal, titular) starts null and is filled in later via updatePatient.
export type PatientInput = Pick<Patient, 'full_name'> &
  Partial<Omit<Patient, 'id' | 'clinic_id' | 'created_at' | 'full_name'>>

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase.from('patients').select('*').is('deleted_at', null).order('full_name')
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
  const { error } = await supabase.rpc('soft_delete_patient', { p_patient_id: id })
  if (error) throw error
}

export async function restorePatient(id: string) {
  const { error } = await supabase.rpc('restore_patient', { p_patient_id: id })
  if (error) throw error
}

async function getMyClinicIdOrThrow(): Promise<string> {
  const { data, error } = await supabase.rpc('get_my_clinic_id')
  if (error) throw error
  if (!data) throw new Error('El usuario no pertenece a ningún consultorio')
  return data
}

async function getMyUserIdOrThrow(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('No hay una sesión activa')
  return data.user.id
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
  odontogram_type?: OdontogramType
  motivo_consulta?: string | null
  observaciones_generales?: string | null
}

export async function getClinicalRecords(patientId: string): Promise<ClinicalRecord[]> {
  const { data, error } = await supabase
    .from('clinical_records')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('visit_date', { ascending: false })
  if (error) throw error
  return data
}

export async function deleteClinicalRecord(id: string) {
  const { error } = await supabase.rpc('soft_delete_clinical_record', { p_record_id: id })
  if (error) throw error
}

export async function restoreClinicalRecord(id: string) {
  const { error } = await supabase.rpc('restore_clinical_record', { p_record_id: id })
  if (error) throw error
}

export async function getClinicalRecord(id: string): Promise<ClinicalRecord> {
  const { data, error } = await supabase.from('clinical_records').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createClinicalRecord(input: ClinicalRecordInput): Promise<ClinicalRecord> {
  const clinicId = await getMyClinicIdOrThrow()
  const userId = await getMyUserIdOrThrow()
  const { data, error } = await supabase
    .from('clinical_records')
    .insert({ ...input, clinic_id: clinicId, created_by: userId })
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
    .is('deleted_at', null)
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
  const { error } = await supabase.rpc('soft_delete_billing_item', { p_billing_item_id: id })
  if (error) throw error
}

export async function restoreBillingItem(id: string) {
  const { error } = await supabase.rpc('restore_billing_item', { p_billing_item_id: id })
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
    .is('deleted_at', null)
    .order('proforma_number', { ascending: false })
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
  const userId = await getMyUserIdOrThrow()
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
      created_by: userId,
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
  const { error } = await supabase.rpc('soft_delete_proforma', { p_proforma_id: id })
  if (error) throw error
}

export async function restoreProforma(id: string) {
  const { error } = await supabase.rpc('restore_proforma', { p_proforma_id: id })
  if (error) throw error
}

// ---------- Consentimientos ----------

export async function getConsents(patientId: string): Promise<Consent[]> {
  const { data, error } = await supabase
    .from('consents')
    .select('*')
    .eq('patient_id', patientId)
    .order('signed_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getConsent(id: string): Promise<Consent> {
  const { data, error } = await supabase.from('consents').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createConsent(
  patientId: string,
  consentText: string,
  patientSignatureDataUrl: string,
  professionalSignatureDataUrl: string,
): Promise<Consent> {
  const clinicId = await getMyClinicIdOrThrow()
  const userId = await getMyUserIdOrThrow()
  const { data, error } = await supabase
    .from('consents')
    .insert({
      patient_id: patientId,
      clinic_id: clinicId,
      consent_text: consentText,
      patient_signature_data_url: patientSignatureDataUrl,
      professional_signature_data_url: professionalSignatureDataUrl,
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteConsent(id: string) {
  const { error } = await supabase.from('consents').delete().eq('id', id)
  if (error) throw error
}

// ---------- Recibos (generados automáticamente al cobrar un tratamiento) ----------

export async function getReceipts(patientId: string): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('receipt_number', { ascending: false })
  if (error) throw error
  return data
}

export async function getReceipt(id: string): Promise<Receipt> {
  const { data, error } = await supabase.from('receipts').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function getAllReceipts(): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .is('deleted_at', null)
    .order('receipt_number', { ascending: false })
  if (error) throw error
  return data
}

// ---------- Links públicos de recibos y proformas (vencen a los 10 días) ----------

// Genera o renueva el token público y devuelve la URL lista para compartir.
export async function shareReceipt(id: string): Promise<string> {
  const { data, error } = await supabase.rpc('share_receipt', { p_receipt_id: id })
  if (error) throw error
  return `${window.location.origin}/ver/recibo/${data}`
}

export async function shareProforma(id: string): Promise<string> {
  const { data, error } = await supabase.rpc('share_proforma', { p_proforma_id: id })
  if (error) throw error
  return `${window.location.origin}/ver/proforma/${data}`
}

// Devuelven null si el token no existe, venció, o el documento fue eliminado.
export async function getPublicReceipt(token: string): Promise<PublicReceiptDoc | null> {
  const { data, error } = await supabase.rpc('get_public_receipt', { p_token: token })
  if (error) throw error
  return data
}

export async function getPublicProforma(token: string): Promise<PublicProformaDoc | null> {
  const { data, error } = await supabase.rpc('get_public_proforma', { p_token: token })
  if (error) throw error
  return data
}

// ---------- Papelera (elementos eliminados, recuperables por 30 días) ----------

export async function getTrash(): Promise<TrashItem[]> {
  const [patientsRes, proformasRes, recordsRes, billingRes, receiptsRes] = await Promise.all([
    supabase.from('patients').select('id, full_name, deleted_at, deleted_by').not('deleted_at', 'is', null),
    supabase
      .from('proformas')
      .select('id, patient_id, proforma_number, deleted_at, deleted_by, patients(full_name)')
      .not('deleted_at', 'is', null),
    supabase
      .from('clinical_records')
      .select('id, patient_id, visit_date, deleted_at, deleted_by, patients(full_name)')
      .not('deleted_at', 'is', null),
    supabase
      .from('billing_items')
      .select('id, patient_id, treatment_name, deleted_at, deleted_by, patients(full_name)')
      .not('deleted_at', 'is', null),
    supabase
      .from('receipts')
      .select('id, patient_id, receipt_number, deleted_at, deleted_by, patients(full_name)')
      .not('deleted_at', 'is', null),
  ])
  if (patientsRes.error) throw patientsRes.error
  if (proformasRes.error) throw proformasRes.error
  if (recordsRes.error) throw recordsRes.error
  if (billingRes.error) throw billingRes.error
  if (receiptsRes.error) throw receiptsRes.error

  const deletedByNames = await getDeletedByNames([
    ...patientsRes.data,
    ...proformasRes.data,
    ...recordsRes.data,
    ...billingRes.data,
    ...receiptsRes.data,
  ])

  // Un hijo se considera "cascaded" (borrado junto con su paciente) cuando su
  // deleted_at coincide exactamente con el deleted_at del paciente — mismo
  // now() de la transacción del RPC soft_delete_patient. La Papelera no le
  // muestra botón de restaurar propio: se restaura junto con el paciente.
  const patientDeletedAt = new Map(patientsRes.data.map((p) => [p.id, p.deleted_at]))
  const isCascaded = (patientId: string, deletedAt: string) => patientDeletedAt.get(patientId) === deletedAt

  type ChildRow = {
    id: string
    patient_id: string
    deleted_at: string
    deleted_by: string | null
    patients: { full_name: string } | null
  }

  const items: TrashItem[] = [
    ...patientsRes.data.map(
      (p): TrashItem => ({
        type: 'patient',
        id: p.id,
        label: p.full_name,
        patient_name: p.full_name,
        deleted_at: p.deleted_at as string,
        deleted_by_name: deletedByNames.get(p.deleted_by ?? '') ?? null,
        cascaded: false,
      }),
    ),
    ...(proformasRes.data as unknown as (ChildRow & { proforma_number: number })[]).map(
      (p): TrashItem => ({
        type: 'proforma',
        id: p.id,
        label: `Proforma #${p.proforma_number}`,
        patient_name: p.patients?.full_name ?? '',
        deleted_at: p.deleted_at,
        deleted_by_name: deletedByNames.get(p.deleted_by ?? '') ?? null,
        cascaded: isCascaded(p.patient_id, p.deleted_at),
      }),
    ),
    ...(recordsRes.data as unknown as (ChildRow & { visit_date: string })[]).map(
      (r): TrashItem => ({
        type: 'clinical_record',
        id: r.id,
        label: `Consulta del ${r.visit_date}`,
        patient_name: r.patients?.full_name ?? '',
        deleted_at: r.deleted_at,
        deleted_by_name: deletedByNames.get(r.deleted_by ?? '') ?? null,
        cascaded: isCascaded(r.patient_id, r.deleted_at),
      }),
    ),
    ...(billingRes.data as unknown as (ChildRow & { treatment_name: string })[]).map(
      (b): TrashItem => ({
        type: 'billing_item',
        id: b.id,
        label: b.treatment_name,
        patient_name: b.patients?.full_name ?? '',
        deleted_at: b.deleted_at,
        deleted_by_name: deletedByNames.get(b.deleted_by ?? '') ?? null,
        // También se considera "cascaded" si vino junto con el paciente; si no,
        // se restaura sola en la papelera (junto con su recibo, vía restoreBillingItem).
        cascaded: isCascaded(b.patient_id, b.deleted_at),
      }),
    ),
    ...(receiptsRes.data as unknown as (ChildRow & { receipt_number: number })[]).map(
      (r): TrashItem => ({
        type: 'receipt',
        id: r.id,
        label: `Recibo #${r.receipt_number}`,
        patient_name: r.patients?.full_name ?? '',
        deleted_at: r.deleted_at,
        deleted_by_name: deletedByNames.get(r.deleted_by ?? '') ?? null,
        // Los recibos siempre son "cascaded" (se restauran con el paciente o con su cobro, nunca solos).
        cascaded: true,
      }),
    ),
  ]

  return items.sort((a, b) => (a.deleted_at < b.deleted_at ? 1 : -1))
}

async function getDeletedByNames(rows: { deleted_by: string | null }[]): Promise<Map<string, string>> {
  const ids = [...new Set(rows.map((r) => r.deleted_by).filter((id): id is string => !!id))]
  if (ids.length === 0) return new Map()
  const { data, error } = await supabase.from('clinic_users').select('id, first_name, last_name').in('id', ids)
  if (error) throw error
  return new Map(data.map((u) => [u.id, `${u.first_name} ${u.last_name}`.trim()]))
}

// ---------- Auditoría / respaldo de datos ----------

export async function requestDataExport(): Promise<boolean> {
  const { data, error } = await supabase.rpc('request_data_export')
  if (error) throw error
  return data
}

// ---------- Dashboard (resumen por rango de fechas, todo el consultorio) ----------

export async function getAppointmentsByDateRange(fromDate: string, toDate: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(full_name)')
    .gte('appointment_date', fromDate)
    .lte('appointment_date', toDate)
    .order('appointment_date')
    .order('appointment_time')
  if (error) throw error
  return data as unknown as Appointment[]
}

export async function getBillingItemsByDateRange(fromDate: string, toDate: string): Promise<BillingItem[]> {
  const { data, error } = await supabase
    .from('billing_items')
    .select('*')
    .is('deleted_at', null)
    .gte('visit_date', fromDate)
    .lte('visit_date', toDate)
  if (error) throw error
  return data
}

export async function getProformasByDateRange(fromDate: string, toDate: string): Promise<Proforma[]> {
  const { data, error } = await supabase
    .from('proformas')
    .select('*')
    .is('deleted_at', null)
    .gte('created_at', `${fromDate}T00:00:00`)
    .lte('created_at', `${toDate}T23:59:59.999`)
  if (error) throw error
  return data
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
  const userId = await getMyUserIdOrThrow()
  const { data, error } = await supabase
    .from('cash_register')
    .upsert(
      { ...input, clinic_id: clinicId, created_by: userId },
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

export async function createPaymentRequest(
  planCode: PlanCode,
  amountBs: number,
  proofStoragePath: string,
  extraSeats = 0,
): Promise<PaymentRequest> {
  const clinicId = await getMyClinicIdOrThrow()
  const userId = await getMyUserIdOrThrow()
  const { data, error } = await supabase
    .from('payment_requests')
    .insert({
      clinic_id: clinicId,
      plan_code: planCode,
      amount_bs: amountBs,
      extra_seats: extraSeats,
      proof_storage_path: proofStoragePath,
      requested_by: userId,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ---------- Contenido del sitio (mini-CMS de la landing) ----------

export async function getSiteContent(): Promise<Partial<SiteContentMap>> {
  const { data, error } = await supabase.from('site_content').select('key, content')
  if (error) throw error
  const map: Record<string, unknown> = {}
  for (const row of data) map[row.key] = row.content
  return map as Partial<SiteContentMap>
}

export async function adminUpdateSiteContent<K extends keyof SiteContentMap>(
  key: K,
  content: SiteContentMap[K],
): Promise<void> {
  const { error } = await supabase.from('site_content').update({ content, updated_at: new Date().toISOString() }).eq('key', key)
  if (error) throw error
}

export async function adminUploadSiteImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  // Unique path per upload, no upsert — same reasoning as uploadClinicLogo: an
  // upsert:true upload evaluates the UPDATE storage policy too and fails RLS
  // even on a brand-new object.
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('site-images').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('site-images').getPublicUrl(path)
  return data.publicUrl
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
  const { error } = await supabase.rpc('admin_approve_payment_request', {
    p_request_id: request.id,
    p_duration_months: durationMonths,
  })
  if (error) throw error
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

export async function adminGetClinicUsers(): Promise<AdminClinicUser[]> {
  const { data, error } = await supabase.rpc('admin_get_clinic_users')
  if (error) throw error
  return data
}

export async function adminUpdateClinicName(clinicId: string, name: string): Promise<void> {
  const { error } = await supabase.rpc('admin_update_clinic_name', { p_clinic_id: clinicId, p_name: name })
  if (error) throw error
}

export async function adminUpdateTrialEnd(clinicId: string, newTrialEndsAt: string): Promise<void> {
  const { error } = await supabase.rpc('admin_update_trial_end', {
    p_clinic_id: clinicId,
    p_new_trial_ends_at: newTrialEndsAt,
  })
  if (error) throw error
}
