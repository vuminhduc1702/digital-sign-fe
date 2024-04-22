import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type TemplateList } from '../types'

type GetTemplates = {
  projectId: string
  protocol?: 'default' | 'Lw2m2'
  search_field?: string
  search_str?: string
}

export const getTemplates = ({
  projectId,
  protocol,
  search_field,
  search_str,
}: GetTemplates): Promise<TemplateList> => {
  return axios.get(`/api/templates`, {
    params: {
      project_id: projectId,
      protocol,
      search_field,
      search_str,
    },
  })
}

type QueryFnType = typeof getTemplates

type UseTemplateOptions = {
  config?: QueryConfig<QueryFnType>
} & GetTemplates

export const useGetTemplates = ({
  projectId,
  protocol,
  search_field,
  search_str,
  config,
}: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['templates', projectId, protocol, search_field, search_str],
    queryFn: () =>
      getTemplates({ projectId, protocol, search_field, search_str }),
    ...config,
  })
}
