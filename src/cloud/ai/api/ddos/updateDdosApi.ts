import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { type GetDdosDTO } from '../../types'
import { axios } from '~/lib/axios'
import { toast } from 'sonner'

export const updateDdosAi = (data: GetDdosDTO) => {
  return axios.post(`/ai/ddos`, data)
}

type UseUpdateDdosAi = {
  config?: MutationConfig<typeof updateDdosAi>
}

export const useMutationDdosAi = ({ config }: UseUpdateDdosAi = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['call-ddos-api'],
      })
      toast.success(t('form:user.ddos'))
    },
    ...config,
    mutationFn: updateDdosAi,
  })
}
