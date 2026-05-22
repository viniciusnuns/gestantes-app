import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://odirmtmompghjgmhotml.supabase.co'
const supabaseAnonKey = 'sb_publishable_60Fl-nhRPO7Mhd50BSLvdA_3eLie2s6'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  name: string
  week: number
  phone: string
  healthyPregnancy: boolean
  hadIntercurrence: boolean
  doctorApproved: boolean
  objectives: string[]
  discomforts: string[]
  createdAt: string
}
