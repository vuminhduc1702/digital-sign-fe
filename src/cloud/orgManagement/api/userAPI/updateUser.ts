import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateUserDTO = {
  data: {
    name: string
    email: string
    password: string
    org_id: string
  }
  userId: string
}

export const updateUser = ({ data, userId }: UpdateUserDTO) => {
  return axios.put(`/api/users/${userId}`, data)
}

type UseUpdateUserOptions = {
  config?: MutationConfig<typeof updateUser>
}

export const useUpdateUser = ({ config }: UseUpdateUserOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.user_manage.add_user.success_update'),
      })
    },
    ...config,
    mutationFn: updateUser,
  })
}
