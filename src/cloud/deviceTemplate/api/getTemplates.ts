import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type TemplateList } from '../types'

type GetTemplates = {
  projectId: string
  offset?: number
  limit?: number
  protocol?: 'default' | 'Lw2m2'
}

export const getTemplates = ({
  projectId,
  offset,
  limit,
  protocol,
}: GetTemplates): Promise<TemplateList> => {
  return axios.get(`/api/templates`, {
    params: {
      project_id: projectId,
      offset,
      limit,
      protocol,
    },
  })
}

type QueryFnType = typeof getTemplates

type UseTemplateOptions = {
  config?: QueryConfig<QueryFnType>
} & GetTemplates

export const useGetTemplates = ({
  projectId,
  offset = 0,
  limit = limitPagination,
  protocol,
  config,
}: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['templates', projectId, offset, limit, protocol],
    queryFn: () => getTemplates({ projectId, offset, limit, protocol }),
    ...config,
  })
}
