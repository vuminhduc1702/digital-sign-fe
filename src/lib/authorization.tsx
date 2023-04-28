import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'

import { useUser } from './auth'
import { type User } from '~/features/auth'

export enum ROLES {
  TENANT = 'TENANT',
  TENANT_DEV = 'TENANT_DEV',
}

type RoleTypes = keyof typeof ROLES

function isTenant(user: User): boolean {
  return user.system_role === ROLES.TENANT
}

function isTenantDev(user: User): boolean {
  return user.system_role === ROLES.TENANT_DEV
}

export const useAuthorization = () => {
  const user = useUser()
  const { t } = useTranslation()

  if (!user.data) {
    throw Error(t('error.no_user') ?? 'No user found')
  }

  const checkAccess = useCallback(
    ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
      if (!user.data) return false

      if (allowedRoles && allowedRoles.length > 0) {
        return allowedRoles?.includes(user.data.system_role)
      }

      return true
    },
    [user.data],
  )

  return { checkAccess, role: user.data.system_role }
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
