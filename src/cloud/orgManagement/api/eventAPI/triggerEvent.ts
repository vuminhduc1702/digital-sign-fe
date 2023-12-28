import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { toast } from 'sonner'

export type TriggerEventDTO = {
  data: {
    event_id: string
    project_id: string
  }
}

export const triggerEvent = ({ data }: TriggerEventDTO) => {
  return axios.post(
    `/api/events/${data.event_id}/activate?project_id=${data.project_id}`,
  )
}

type UseTriggerEventOptions = {
  config?: MutationConfig<typeof triggerEvent>
}

export const useTriggerEvent = ({ config }: UseTriggerEventOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['events'],
      })
      toast.success(t('cloud:org_manage.event_manage.add_event.success_active'))
    },
    ...config,
    mutationFn: triggerEvent,
  })
}
