import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

type CreateUserRes = {
  identity_id: string
}

export type CreateUserDTO = {
  data: {
    project_id: string
    name: string
    email: string
    password: string
    org_id: string
  }
}

export const createUser = ({ data }: CreateUserDTO): Promise<CreateUserRes> => {
  return axios.post(`/api/users`, data)
}

type UseCreateUserOptions = {
  config?: MutationConfig<typeof createUser>
}

export const useCreateUser = ({ config }: UseCreateUserOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.user_manage.add_user.success_create'),
      })
    },
    ...config,
    mutationFn: createUser,
  })
}
