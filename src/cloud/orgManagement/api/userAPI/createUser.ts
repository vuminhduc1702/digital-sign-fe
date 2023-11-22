import { type z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { useNotificationStore } from '~/stores/notifications'

import { type MutationConfig, queryClient } from '~/lib/react-query'
import { type userSchema } from '../../components/User'

type CreateUserRes = {
  identity_id: string
}

export type CreateUserDTO = {
  data: z.infer<typeof userSchema>
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
