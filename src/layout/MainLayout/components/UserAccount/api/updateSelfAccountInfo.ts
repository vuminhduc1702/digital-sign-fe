import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'
import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'
import { type selfInfoSchema } from '../SelfAccount'

export type UpdateSelfAccountInfo = {
  data: {
    name: string
    phone: string
    email?: string
    profile: {
      tax_code: string
      province: string
      district: string
      ward: string
      full_address?: string
    }
  }
  tenant_id: string
}

export type UpdateSelfAccountInfoDTO = {
  data: z.infer<typeof selfInfoSchema>
}

export const updateSelfAccountInfo = ({
  data,
  tenant_id,
}: UpdateSelfAccountInfo) => {
  return axios.put(`/api/tenant/${tenant_id}`, data)
}

type UseUpdateSelfAccountInfo = {
  config?: MutationConfig<typeof updateSelfAccountInfo>
}

export const useMutationSelfAccountInfo = ({
  config,
}: UseUpdateSelfAccountInfo = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['user-info'],
      })
      toast.success(t('form:user.success_update'))
    },
    ...config,
    mutationFn: updateSelfAccountInfo,
  })
}
