import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type TemplateLwM2MList } from '../types'

type GetTemplates = {
  projectId: string
  offset?: number
  limit?: number
}

export const getTemplatesLwM2M = ({
  projectId,
  offset,
  limit,
}: GetTemplates): Promise<TemplateLwM2MList> => {
  return axios.get(`/api/templates`, {
    params: {
      project_id: projectId,
      offset,
      limit,
    },
  })
}

type QueryFnType = typeof getTemplatesLwM2M

type UseTemplateOptions = {
  config?: QueryConfig<QueryFnType>
} & GetTemplates

export const useGetTemplatesLwM2M = ({
  projectId,
  offset = 0,
  limit = limitPagination,
  config,
}: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['templates', projectId, offset, limit],
    queryFn: () => getTemplatesLwM2M({ projectId, offset, limit }),
    ...config,
  })
}
