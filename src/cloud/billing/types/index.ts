import type { BasePagination } from '~/types'

export type Billing = {
  stt: number
  id: string
  v_name: string
  v_tax_code: string
  v_address: string
  c_name: string
  c_code: string
  c_phone: string
  c_address: string
  s_service: string
  sub_id: string
  register: number
  level_id: number
  cal_unit: string
  charging_unit: string
  quantity: number
  price_unit: number
  cost: number
  date_begin: number
  date_end: number
  date_request: number
  date_expiry: number
  date_payment: number
  status: string
  action: number
  plan_name: string
  s_service_type: string
  pre_tax_cost: number
  p_tax: number
  tax_cost: number
}

export type BillingList = {
  data: Billing[]
} & BasePagination
