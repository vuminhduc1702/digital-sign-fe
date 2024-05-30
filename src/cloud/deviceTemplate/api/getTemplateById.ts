import { useQuery } from '@tanstack/react-query'

import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type Template } from '../types'

export const getTemplateById = ({
  templateId,
}: {
  templateId?: string
}): Promise<Template> => {
  return axios.get(`/api/templates/${templateId}`)
}

type QueryFnType = typeof getTemplateById

type UseTemplateByIdOptions = {
  templateId?: string
  config?: QueryConfig<QueryFnType>
}

export const useTemplateById = ({
  templateId,
  config,
}: UseTemplateByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['templates', templateId],
    queryFn: () => getTemplateById({ templateId }),
    enabled: !!templateId,
    ...config,
  })
}
