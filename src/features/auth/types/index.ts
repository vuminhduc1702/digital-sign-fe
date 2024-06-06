import { type RoleTypes } from '@/lib/authorization'

export type User = {
  expired_at: number
  device_token: string
  is_admin: boolean
  user_id: string
  email: string
  role_id?: string
  role_name?: string
  name?: string
  system_role: RoleTypes
}

export type EndUser = {
  project_id: string
  org_id?: string
  org_name?: string
} & User

// export type UserResponse = {
//   token: string
//   refresh_token: string
//   timestamp: Date
// } & Pick<
//   User,
//   | 'device_token'
//   | 'email'
//   | 'expired_at'
//   | 'is_admin'
//   | 'system_role'
//   | 'user_id'
// >

export type UserResponse = {
  accessToken: string
}
