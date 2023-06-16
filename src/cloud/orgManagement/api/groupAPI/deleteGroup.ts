import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteGroup = ({ id }: { id: string }) => {
  return axios.delete(`/api/groups/${id}`)
}

type UseDeleteGroupOptions = {
  config?: MutationConfig<typeof deleteGroup>
}

export const useDeleteGroup = ({ config }: UseDeleteGroupOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['groups'])
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.group_manage.add_group.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteGroup,
  })
}
