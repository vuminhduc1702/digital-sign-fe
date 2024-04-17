import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { type GetFuelDTO } from '../../types'
import { axios } from '@/lib/axios'
import { toast } from 'sonner'

export const updateFuelAi = (data: GetFuelDTO) => {
  return axios.post(`/ai/fuel`, data)
}

type UseUpdateFuelAi = {
  config?: MutationConfig<typeof updateFuelAi>
}

export const useMutationFuelAi = ({ config }: UseUpdateFuelAi = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['call-fuel-api'],
      })
      toast.success(t('form:user.fuel'))
    },
    ...config,
    mutationFn: updateFuelAi,
  })
}
