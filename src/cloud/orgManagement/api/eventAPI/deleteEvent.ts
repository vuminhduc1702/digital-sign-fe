import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export const deleteEvent = ({
  id,
  projectId,
}: {
  id: string
  projectId: string
}) => {
  return axios.delete(`/api/events/${id}`, {
    params: { project_id: projectId },
  })
}

type UseDeleteEventOptions = {
  config?: MutationConfig<typeof deleteEvent>
}

export const useDeleteEvent = ({ config }: UseDeleteEventOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['events'])      
      toast.promise(() => queryClient.invalidateQueries(['events']), {
        loading: t('loading:loading'),
        success: t('cloud:org_manage.event_manage.add_event.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteEvent,
  })
}
