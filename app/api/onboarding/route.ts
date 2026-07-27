import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co'
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  try {
    const { userId, data } = await req.json()

    if (!userId || !data) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 })
    }

    const now = new Date().toISOString()

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingUser) {
      // Tenta INSERT
      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        email: data.email,
        name: data.name,
        week_at_registration: data.weekAtRegistration,
        registration_date: now,
        estimated_due_date: data.estimatedDueDate || null,
        phone: data.phone,
        healthy_pregnancy: data.healthyPregnancy,
        had_intercurrence: data.hadIntercurrence,
        doctor_approved: data.doctorApproved,
        objectives: data.objectives,
        discomforts: data.discomforts,
        onboarding_completed: true,
        onboarding_completed_at: now,
        user_type: data.userType ?? 'patient',
        product_type: data.productType ?? null,
        first_pregnancy: data.firstPregnancy,
        terms_accepted_at: data.termsAccepted ? now : null,
        account_created_at: now,
        created_at: now,
        updated_at: now,
      })

      if (insertError) {
        // Email duplicado — atualiza pelo email
        if (insertError.code === '23505') {
          const { error: fallbackError } = await supabase.from('users').update({
            name: data.name,
            week_at_registration: data.weekAtRegistration,
            estimated_due_date: data.estimatedDueDate || null,
            phone: data.phone,
            healthy_pregnancy: data.healthyPregnancy,
            had_intercurrence: data.hadIntercurrence,
            doctor_approved: data.doctorApproved,
            objectives: data.objectives,
            discomforts: data.discomforts,
            onboarding_completed: true,
            onboarding_completed_at: now,
            user_type: data.userType ?? 'patient',
            product_type: data.productType ?? null,
            first_pregnancy: data.firstPregnancy,
            terms_accepted_at: data.termsAccepted ? now : null,
            updated_at: now,
          }).eq('email', data.email)

          if (fallbackError) {
            console.error('[api/onboarding] Fallback error:', fallbackError.message)
            return NextResponse.json({ success: false, error: fallbackError.message }, { status: 500 })
          }
        } else {
          console.error('[api/onboarding] Insert error:', insertError.message)
          return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
        }
      }
    } else {
      // UPDATE com service_role — sem restrição de RLS
      const { error: updateError } = await supabase.from('users').update({
        email: data.email,
        name: data.name,
        week_at_registration: data.weekAtRegistration,
        estimated_due_date: data.estimatedDueDate || null,
        phone: data.phone,
        healthy_pregnancy: data.healthyPregnancy,
        had_intercurrence: data.hadIntercurrence,
        doctor_approved: data.doctorApproved,
        objectives: data.objectives,
        discomforts: data.discomforts,
        onboarding_completed: true,
        onboarding_completed_at: now,
        user_type: data.userType ?? 'patient',
        product_type: data.productType ?? null,
        first_pregnancy: data.firstPregnancy,
        terms_accepted_at: data.termsAccepted ? now : null,
        updated_at: now,
      }).eq('id', userId)

      if (updateError) {
        console.error('[api/onboarding] Update error:', updateError.message)
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[api/onboarding] Unexpected error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
