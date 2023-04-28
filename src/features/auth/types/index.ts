export type User = {
  expired_at: number
  device_token: string
  is_admin: boolean
  admin_id?: string
  user_id: string
  email: string
  system_role: 'TENANT' | 'TENANT_DEV'
}

export type UserResponse = {
  token: string
  user: User
}
