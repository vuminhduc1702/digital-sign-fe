import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'

import { useUser } from './auth'
import storage from '~/utils/storage'

import { type User } from '~/features/auth'

export const ROLES = [
  'TENANT',
  'TENANT_DEV',
  'SYSTEM_ADMIN',
  'NORMAL_USER',
] as const

export type RoleTypes = (typeof ROLES)[number]

function isTenant(user: User): boolean {
  return user.system_role === ROLES[0]
}

function isTenantDev(user: User): boolean {
  return user.system_role === ROLES[1]
}

export const useAuthorization = () => {
  const { t } = useTranslation()

  const user = useUser()

  const userStorage = storage.getToken()
  const system_role = userStorage?.system_role

  if (!user.data) {
    throw Error(t('error:no_user'))
  }

  const checkAccess = useCallback(
    ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
      if (!user.data) return false

      if (allowedRoles && allowedRoles.length > 0) {
        return allowedRoles?.includes(system_role)
      }

      return true
    },
    [user.data],
  )

  return { checkAccess, role: system_role }
}

type AuthorizationProps = {
  forbiddenFallback?: React.ReactNode
  children: React.ReactNode
} & (
  | {
      allowedRoles: RoleTypes[]
      policyCheck?: never
    }
  | {
      allowedRoles?: never
      policyCheck: boolean
    }
)

export const Authorization = ({
  policyCheck,
  allowedRoles,
  forbiddenFallback = null,
  children,
}: AuthorizationProps) => {
  const { checkAccess } = useAuthorization()

  let canAccess = false

  if (allowedRoles) {
    canAccess = checkAccess({ allowedRoles })
  }

  if (typeof policyCheck !== 'undefined') {
    canAccess = policyCheck
  }

  return <>{canAccess ? children : forbiddenFallback}</>
}

export const POLICIES = {
  'device:create': (user: User) => {
    if (isTenant(user)) {
      return true
    }

    if (isTenantDev(user)) {
      return true
    }

    return false
  },
}
