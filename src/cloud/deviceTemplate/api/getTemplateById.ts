import { useQuery } from '@tanstack/react-query'

import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Template } from '../types'

export const getTemplateById = ({
  templateId,
}: {
  templateId: string
}): Promise<Template> => {

  let test =  axios.get(`/api/ruleChains?projectId=51a7b00e-beac-4f88-a0a5-dadf28c6cf08&pageSize=10&page=0`)
  
  console.log(test)

  return axios.get(`/api/templates/${templateId}`)
}

type QueryFnType = typeof getTemplateById

type UseTemplateByIdOptions = {
  templateId: string
  config?: QueryConfig<QueryFnType>
}

export const useTemplateById = ({
  templateId,
  config,
}: UseTemplateByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['templateById', templateId],
    queryFn: () => getTemplateById({ templateId }),
    enabled: !!templateId,
    ...config,
  })
}