import { useQuery } from '@tanstack/react-query'

import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Template } from '../types'
import { limitPagination } from '~/utils/const'

export const getTemplateById = ({
  templateId,
  offset,
  limit,
}: {
  templateId: string
  offset?: number
  limit?: number
}): Promise<Template> => {

  return axios.get(`/api/templates/${templateId}`, {
    params: {
      offset,
      limit,
    },
  })
}

type QueryFnType = typeof getTemplateById

type UseTemplateByIdOptions = {
  templateId: string
  config?: QueryConfig<QueryFnType>
  offset?: number
  limit?: number
}

export const useTemplateById = ({
  templateId,
  config,
  offset = 0, 
  limit = limitPagination
}: UseTemplateByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['templates', templateId, offset, limit],
    queryFn: () => getTemplateById({ templateId, offset, limit}),
    enabled: !!templateId,
    ...config,
  })
}