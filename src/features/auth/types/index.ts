import { type BasePagination } from '~/types'

export type User = {
  expired_at: number
  device_token: string
  is_admin: boolean
  user_id: string
  email: string
  role_id?: string
  role_name?: string
  name?: string
  system_role: 'TENANT' | 'TENANT_DEV' | 'SYSTEM_ADMIN' | 'NORMAL_USER'
}

export type EndUser = {
  project_id: string
  org_id?: string
  org_name?: string
} & User

export type UserResponse = {
  token: string
  refresh_token: string
} & User

type Profile = {
  identity_info?: {
    identity?: string
    front_image?: string
    back_image?: string
  }
  dob?: string | null
  nationality?: string
  province?: string
  district?: string
  ward?: string
  full_address?: string
  url?: string
  company?: string
  gender?: string
  profile_image?: string
}

export type UserInfo = {
  name: string
  email: string
  admin_id: string
  user_id: string
  is_admin: boolean
  activate: boolean
  role_id?: string
  role_name?: string
  group_id?: string
  group_name?: string
  profile: Profile
}

export type UserList = {
  users: UserInfo[]
} & BasePagination
