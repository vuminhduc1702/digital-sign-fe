import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type PoliciesReq } from './createDevRole'

export type UpdateDevRoleDTO = {
  data: {
    name: string
    role_type: string
    policies: PoliciesReq[]
  }
  roleId: string
}

export const updateDevRole = ({ data, roleId }: UpdateDevRoleDTO) => {
  return axios.put(
    `/api/roles${data.role_type === 'Group' ? '/group' : ''}/${roleId}`,
    data,
  )
}

type UseUpdateDevRoleOptions = {
  config?: MutationConfig<typeof updateDevRole>
}

export const useUpdateDevRole = ({ config }: UseUpdateDevRoleOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dev-role'] })
      addNotification({
        type: 'success',
        title: t('cloud:role_manage.add_role.success_update'),
      })
    },
    ...config,
    mutationFn: updateDevRole,
  })
}
