import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export type RequestHandlingTimeDTO = {
  projectId: string
  method?: string
  url?: string
}

export type RequestHandlingTimeData = {
  avg_latency: number
  total_request: number
}

export const RequestHandlingTime = ({
  projectId,
  method,
  url 
}: RequestHandlingTimeDTO): Promise<RequestHandlingTimeData> => {
  return axios.post(`/api/overviews/latency`, {
    project_id: projectId,
    method,
    url
  })
}

type UseRequestHandlingTimeOptions = {
  config?: MutationConfig<typeof RequestHandlingTime>
}

export const useRequestHandlingTime = ({
  config,
}: UseRequestHandlingTimeOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['request-handling-time'],
      })
    },
    ...config,
    mutationFn: RequestHandlingTime,
  })
}
