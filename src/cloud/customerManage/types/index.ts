import { type Profile } from '@/cloud/orgManagement/api/userAPI'
import { type BasePagination } from '@/types'

export type Customer = {
  email: string
  phone: string
  username: string
  name: string
  admin_id: string
  user_id: string
  is_admin: boolean
  customer_code: string
  activate: boolean
  profile: Profile
  cmp_role: string
  valid_to: number
  created_time: number
  approve_user_info: any
  role_name: string
  org_name: string
  isExpanded: boolean
}

export type CustomerList = {
  data: Customer[]
} & BasePagination
