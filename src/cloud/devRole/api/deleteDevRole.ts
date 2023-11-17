import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteDevRole = ({ id }: { id: string }) => {
  return axios.delete(`/api/roles/${id}`)
}

type UseDeleteDevRoleOptions = {
  config?: MutationConfig<typeof deleteDevRole>
}

export const useDeleteDevRole = ({ config }: UseDeleteDevRoleOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['dev-role'])
      addNotification({
        type: 'success',
        title: t('cloud:role_manage.add_role.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteDevRole,
  })
}
