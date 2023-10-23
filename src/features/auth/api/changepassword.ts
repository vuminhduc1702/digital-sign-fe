import { axios } from '~/lib/axios'

import { type UserResponse } from '../types'
import { MutationConfig, queryClient } from '~/lib/react-query'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '~/stores/notifications'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { passwordSchema } from '~/utils/schemaValidation'
import i18n from '~/i18n'

export const ChangePaswordSchema = z
  .object({
    new_password: passwordSchema,
    new_password_confirm: passwordSchema,
    old_password: passwordSchema,
  })
  .superRefine(({ new_password_confirm, new_password }, ctx) => {
    if (new_password_confirm !== new_password) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: i18n.t('auth:pass_invalid'),
      })
    }
  })

export type changePasswordDTO = { data: z.infer<typeof ChangePaswordSchema> }

export const changePassword = (
  data: changePasswordDTO,
): Promise<UserResponse> => {
  return axios.post('/api/tenant/changepassword', data)
}

type UseChangePassword = {
  config?: MutationConfig<typeof changePassword>
}

export const useChangePassword = ({ config }: UseChangePassword = {}) => {
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
    mutationFn: changePassword,
  })
}