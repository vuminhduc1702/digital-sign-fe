import { axios } from '~/lib/axios'

import { type UserResponse } from '../types'
import { MutationConfig, queryClient } from '~/lib/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { emailSchema, passwordSchema } from '~/utils/schemaValidation'

// export type ForgetPasswordCredentialsDTO = {
//   email: string
//   password: string
//   otp: string
// }
export const ForgetPasswordCredentialsSchema = z.object({
  email : emailSchema,
  password : passwordSchema,
  otp : z.string()
  
})
export type ForgetPasswordCredentialsDTO = { data: z.infer<typeof ForgetPasswordCredentialsSchema> }

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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['email'],
      })
      toast.success(t('auth:success_password'))
    },
    ...config,
    mutationFn: changePassWithEmailAndPassword,
  })
}
