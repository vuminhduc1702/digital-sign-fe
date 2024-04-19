import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { queryClient, type MutationConfig } from '@/lib/react-query'

import { type BaseAPIRes } from '@/types'
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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['entity-thingservices'],
      })
    },
    ...config,
    mutationFn: executeService,
  })
}
