import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'

import storage from '~/utils/storage'

export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  TENANT: 'TENANT',
  TENANT_DEV: 'TENANT_DEV',
  END_USER: 'END_USER',
} as const
export type RoleTypes = (typeof ROLES)[keyof typeof ROLES]

export const useAuthorization = () => {
  const { t } = useTranslation()

  const userStorage = storage.getToken()

  if (!userStorage) {
    throw Error(t('error:no_user'))
  }

  const checkAccess = useCallback(
    ({ allowedRoles }: { allowedRoles: Readonly<RoleTypes[]> }) => {
      if (!userStorage) return false

      if (allowedRoles && allowedRoles.length > 0) {
        return allowedRoles?.includes(userStorage?.system_role)
      }

      return true
    },
    [userStorage],
  )

  return { checkAccess, role: userStorage?.system_role }
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
