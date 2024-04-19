import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type PlanList } from '../types'

type GetPlansDTO = {
  projectId: string
  offset?: number
  limit?: number
}

export const GetPlans = ({
  projectId,
  offset,
  limit,
}: GetPlansDTO): Promise<PlanList> => {
  return axios.get(`/api/priceplan/allplans`, {
    params: {
      project_id: projectId,
      offset,
      limit,
    },
  })
}

type QueryFnType = typeof GetPlans

type UseTemplateOptions = {
  config?: QueryConfig<QueryFnType>
} & GetPlansDTO

export const useGetPlans = ({
  projectId,
  offset = 0,
  limit = limitPagination,
  config,
}: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['plans', projectId, offset, limit],
    queryFn: () => GetPlans({ projectId, offset, limit }),
    ...config,
  })
}
