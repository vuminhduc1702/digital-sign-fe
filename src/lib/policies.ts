import { type UserResponse } from '~/features/auth'
import { ROLES } from './authorization'
import { type Device } from '~/cloud/orgManagement'

export const POLICIES = {
  'device:create': (user: UserResponse) => {
    if (isSystemAdmin(user) || isTenant(user)) return true

    return false
  },
  'device:edit': (user: UserResponse, device: Device) => {
    if (
      isSystemAdmin(user) ||
      isTenant(user) ||
      (isTenantDev(user) && user.user_id === device.created_by) ||
      (isEndUser(user) && user.user_id === device.created_by)
    )
      return true

    return false
  },
  'device:delete': (user: UserResponse, device: Device) => {
    if (
      isSystemAdmin(user) ||
      isTenant(user) ||
      (isTenantDev(user) && user.user_id === device.created_by) ||
      (isEndUser(user) && user.user_id === device.created_by)
    )
      return true

    return false
  },
}

function isSystemAdmin(user: UserResponse): boolean {
  return user.system_role === ROLES.SYSTEM_ADMIN
}
function isTenant(user: UserResponse): boolean {
  return user.system_role === ROLES.TENANT
}
function isTenantDev(user: UserResponse): boolean {
  return user.system_role === ROLES.TENANT_DEV
}
function isEndUser(user: UserResponse): boolean {
  return user.system_role === ROLES.END_USER
}
