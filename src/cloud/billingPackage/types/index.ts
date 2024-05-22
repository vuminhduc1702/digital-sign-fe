import { type BaseAPIRes, type BasePagination } from '@/types'

export type Plan = {
  id: string
  name: string
  type: string
  description: string
  status: string
  payment_type: string
  type_period: string
  period: number
  cal_unit: string
  fix_cost: number
  charging_unit: string
  estimate: string
  price: number
  quantity_free: number
  plan_lv: PlanlvList[]
  expiry: number
  project_id: string
  date_created: number
  tax: number
  updatable: boolean
}

export type PlanById = {
  data: Plan
} & BaseAPIRes

export type PlanList = {
  data: Plan[]
} & BasePagination

export type PlanlvList = {
  level?: number | string
  free?: number | string
  price?: number | string
  estimate?: string
}

export type PlanFilter = {
  id: string
  name: string
  description: string
}
