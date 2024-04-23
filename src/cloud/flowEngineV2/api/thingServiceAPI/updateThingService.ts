import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'
import { type CreateServiceThingDTO } from './createThingService'

export const updateThingService = ({
  data,
  thingId,
  name,
}: CreateServiceThingDTO) => {
  return axios.put(`/api/fe/thing/${thingId}/service/${name}`, data)
}

type UseUpdateServiceOptions = {
  config?: MutationConfig<typeof updateThingService>
}

export const useUpdateService = ({ config }: UseUpdateServiceOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['serviceById'],
      })
      toast.success(t('cloud:custom_protocol.service.success_update'))
    },
    ...config,
    mutationFn: updateThingService,
  })
}
