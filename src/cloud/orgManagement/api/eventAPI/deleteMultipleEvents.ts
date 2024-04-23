import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export type deleteEntityMultipleEventsDTO = {
  data: {
    ids: string[]
  }
}

export const deleteMultipleEvents = (data: deleteEntityMultipleEventsDTO) => {
  return axios.delete(`/api/events/remove/list`, data)
}

type UseDeleteMultipleEventOptions = {
  config?: MutationConfig<typeof deleteMultipleEvents>
}

export const useDeleteMultipleEvents = ({
  config,
}: UseDeleteMultipleEventOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['events']), {
        loading: t('loading:loading'),
        success: t('cloud:org_manage.event_manage.add_event.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteMultipleEvents,
  })
}
