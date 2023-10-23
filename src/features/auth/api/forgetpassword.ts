import { axios } from '~/lib/axios'

import { type UserResponse } from '../types'
import { MutationConfig, queryClient } from '~/lib/react-query'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '~/stores/notifications'
import { useMutation } from '@tanstack/react-query'

export type ForgetPasswordCredentialsDTO = {
  email: string
  password: string
  otp: string
}

export const changePassWithEmailAndPassword = (
  data: ForgetPasswordCredentialsDTO,
): Promise<UserResponse> => {
  return axios.post('/api/password', data)
}

type UseChangePassWithEmailAndPassword = {
  config?: MutationConfig<typeof changePassWithEmailAndPassword>
}

export const useChangePassWithEmailAndPassword = ({ config }: UseChangePassWithEmailAndPassword = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['email'],
      })
      addNotification({
        type: 'success',
        title: t('auth:success_password'),
      })
    },
    ...config,
    mutationFn: changePassWithEmailAndPassword,
  })
}
