import { supabase } from './supabaseClient'
import type { ClinicRole, ClinicUser } from './types'

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getMyClinicUser(): Promise<ClinicUser | null> {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) return null

  const { data, error } = await supabase
    .from('clinic_users')
    .select('*')
    .eq('id', sessionData.session.user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

export interface ContactDetails {
  firstName: string
  lastName: string
  phone: string
  address: string
}

export async function registerClinic(clinicName: string, contact: ContactDetails, termsAccepted: boolean) {
  const { data, error } = await supabase.rpc('register_clinic', {
    p_clinic_name: clinicName,
    p_first_name: contact.firstName,
    p_last_name: contact.lastName,
    p_phone: contact.phone,
    p_address: contact.address,
    p_terms_accepted: termsAccepted,
  })
  if (error) throw error
  return data
}

export async function joinClinicWithCode(
  inviteCode: string,
  contact: ContactDetails,
  role: ClinicRole,
  termsAccepted: boolean,
) {
  const { data, error } = await supabase.rpc('join_clinic_with_code', {
    p_invite_code: inviteCode,
    p_first_name: contact.firstName,
    p_last_name: contact.lastName,
    p_phone: contact.phone,
    p_address: contact.address,
    p_role: role,
    p_terms_accepted: termsAccepted,
  })
  if (error) throw error
  return data
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/restablecer-password`,
  })
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function checkIsPlatformAdmin(): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) return false
  const { data, error } = await supabase.rpc('is_platform_admin')
  if (error) throw error
  return !!data
}
