import { useCallback } from 'react'

import storage from '@/utils/storage'

export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  TENANT: 'TENANT',
  TENANT_DEV: 'TENANT_DEV',
  END_USER: 'END_USER',
} as const
export type RoleTypes = (typeof ROLES)[keyof typeof ROLES]

type CheckAccess = {
  allowedRoles: Readonly<RoleTypes[]>
}

export const checkAccess = ({ allowedRoles }: CheckAccess) => {
  const userStorage = storage.getToken()

  if (!userStorage) return false

  if (allowedRoles && allowedRoles.length > 0) {
    return allowedRoles.includes(userStorage?.system_role)
  }

  return true
}

export const useAuthorization = () => {
  const userStorage = storage.getToken()

  const checkAccessInternal = useCallback(
    ({ allowedRoles }: CheckAccess) => checkAccess({ allowedRoles }),
    [],
  )

  return {
    checkAccessHook: checkAccessInternal,
    role: userStorage?.system_role,
  }
}

type AuthorizationProps = {
  forbiddenFallback?: React.ReactNode
  children: React.ReactNode
} & (
  | {
      allowedRoles: Readonly<RoleTypes[]>
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
  const { checkAccessHook } = useAuthorization()

  let canAccess = false

  if (allowedRoles) {
    canAccess = checkAccessHook({ allowedRoles })
  }

  if (typeof policyCheck !== 'undefined') {
    canAccess = policyCheck
  }

  return <>{canAccess ? children : forbiddenFallback}</>
}
