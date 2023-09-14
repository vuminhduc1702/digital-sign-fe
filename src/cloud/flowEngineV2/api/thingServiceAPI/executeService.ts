import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type BaseAPIRes } from '~/types'
import { type dataRun } from '../../components/ThingService'

type executeServices = {
  data: any
} & BaseAPIRes

export type executeServiceDTO = {
  data: dataRun
  thingId: string
  projectId: string
  name: string
  isDebugMode: boolean
}

export const executeService = ({
  data,
  thingId,
  projectId,
  name,
  isDebugMode,
}: executeServiceDTO): Promise<executeServices> => {
  console.log('data: ', data)
  return axios.post(`/api/fe/thing/${thingId}/service/${name}`, data, {
    params: {
      project_id: projectId,
      validate: isDebugMode,
    },
  })
}

type UseExecuteServiceOptions = {
  config?: MutationConfig<typeof executeService>
}

export const useExecuteService = ({
  config,
}: UseExecuteServiceOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['entity-thingservices'],
      })
      // addNotification({
      //   type: 'success',
      //   title: t('cloud:custom_protocol.service.success_create'),
      // })
    },
    ...config,
    mutationFn: executeService,
  })
}
