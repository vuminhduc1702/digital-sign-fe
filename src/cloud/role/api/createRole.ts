import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type Role, type Policies } from '../types'
import { type RoleTypes } from '~/lib/authorization'

export type CreateRoleDTO = {
  data: {
    name: string
    project_id: string
    policies: Policies[]
    role_type: string
    applicable_to: RoleTypes
  }
}

export const createRole = ({ data }: CreateRoleDTO): Promise<Role> => {
  return axios.post(
    `/api/roles${data.role_type === 'Group' ? '/group' : ''}`,
    data,
  )
}

type UseCreateRoleOptions = {
  config?: MutationConfig<typeof createRole>
}

export const useCreateRole = ({ config }: UseCreateRoleOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['roles'],
      })
      toast.success(t('cloud:role_manage.add_role.success_create'))
    },
    ...config,
    mutationFn: createRole,
  })
}
