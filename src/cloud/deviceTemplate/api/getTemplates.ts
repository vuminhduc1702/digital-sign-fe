import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type TemplateList } from '../types'

type GetTemplates = {
  projectId: string
  protocol?: 'default' | 'Lw2m2'
}

export const getTemplates = ({
  projectId,
  protocol,
}: GetTemplates): Promise<TemplateList> => {
  return axios.get(`/api/templates`, {
    params: {
      project_id: projectId,
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
  protocol,
  config,
}: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['templates', projectId, protocol],
    queryFn: () => getTemplates({ projectId, protocol }),
    ...config,
  })
}
