import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export const deleteThingService = ({ thingId, name }: { thingId: string, name: string }) => {
  return axios.delete(`/api/fe/thing/${thingId}/service/${name}`)
}

type ThingServiceDeleteUserOptions = {
  config?: MutationConfig<typeof deleteThingService>
}

export const useDeleteThingService = ({ config }: ThingServiceDeleteUserOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['service-things']), {
        loading: t('loading:loading'),
        success: t('cloud:custom_protocol.service.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteThingService,
  })
}
