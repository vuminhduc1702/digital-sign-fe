import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteUser = ({ user_id }: { user_id: string }) => {
  return axios.delete(`/api/users/${user_id}`)
}

type UseDeleteUserOptions = {
  config?: MutationConfig<typeof deleteUser>
}

export const useDeleteUser = ({ config }: UseDeleteUserOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['users'])
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.user_manage.add_user.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteUser,
  })
}
