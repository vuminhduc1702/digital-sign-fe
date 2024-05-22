import type { BasePagination } from '@/types'

export type Subcription = {
  c_customer_code: string
  c_name: string
  c_user_email: string
  c_user_phone: string
  p_cal_unit: string
  p_charging_unit: string
  p_description: string
  p_estimate: string
  p_fix_cost: number
  p_id: string
  p_name: string
  p_payment_type: string
  p_period: string
  p_price: number
  p_quantity_free: number
  p_status: string
  p_type: string
  p_type_period: string
  s_cycle_now: number | string
  s_date_register: number
  s_id: string
  s_register: number
  s_service_type: string
  s_status: string
  s_user_id: string
  v_name: string
}

export type SubcriptionList = {
  data: Subcription[]
} & BasePagination
