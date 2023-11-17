import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import {
  type ResourcesType,
  type Role,
  type ActionsType,
  type SelectType,
} from '../types'

export type PoliciesReq = {
  policy_name: string
  resources: ResourcesType['value'][]
  actions: ActionsType['value'][]
  devices: SelectType['value'][]
  users: SelectType['value'][]
  events: SelectType['value'][]
  orgs: SelectType['value'][]
}

export type CreateDevRoleDTO = {
  data: {
    name: string
    project_id: string
    policies: PoliciesReq[]
    role_type: string
  }
}

export const createDevRole = ({ data }: CreateDevRoleDTO): Promise<Role> => {
  return axios.post(
    `/api/roles${data.role_type === 'Group' ? '/group' : ''}`,
    data,
  )
}

type UseCreateDevRoleOptions = {
  config?: MutationConfig<typeof createDevRole>
}

export const useCreateDevRole = ({ config }: UseCreateDevRoleOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['dev-role'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:role_manage.add_role.success_create'),
      })
    },
    ...config,
    mutationFn: createDevRole,
  })
}
