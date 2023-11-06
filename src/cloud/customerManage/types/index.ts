import { type BaseAPIRes, type BasePagination } from '~/types'

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
  profile: {
    identity_info: {
      identity: string
      front_image: string
      back_image: string
      registration_form_image: string
      authorization_letter_image: string
    }
    dob: any
    nationality: string
    province: string
    district: string
    ward: string
    full_address: string
    url: string
    company: string
    gender: string
    profile_image: string
  }
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
