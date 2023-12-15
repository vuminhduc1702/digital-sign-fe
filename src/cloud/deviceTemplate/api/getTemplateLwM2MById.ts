import { useQuery } from '@tanstack/react-query'

import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type TemplateLwM2M } from '../types'

export const getTemplateLwM2MById = ({
  templateId,
}: {
  templateId: string
}): Promise<TemplateLwM2M> => {

  return axios.get(`/api/templates/6d1f5217-47f3-4bec-ad14-d82d71e8d263`)
}

type QueryFnType = typeof getTemplateLwM2MById

type UseTemplateLwM2MByIdOptions = {
  templateId: string
  config?: QueryConfig<QueryFnType>
}

export const useTemplateLwM2MById = ({
  templateId,
  config,
}: UseTemplateLwM2MByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['templates', templateId],
    queryFn: () => getTemplateLwM2MById({ templateId }),
    enabled: !!templateId,
    ...config,
  })
}