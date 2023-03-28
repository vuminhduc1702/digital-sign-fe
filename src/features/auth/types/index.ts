export type AuthUser = {
  phone: string
  name: string
  email: string
  role_name: 'DefaultAdminRole' | 'DefaultUserRole'
  role_id: string
  user_id: string
  admin_id: string
  activate: boolean
  device_quantity: number
  is_admin: boolean
  msg_quantity: number
}

export type UserResponse = {
  jwt: string
  user: AuthUser
}
