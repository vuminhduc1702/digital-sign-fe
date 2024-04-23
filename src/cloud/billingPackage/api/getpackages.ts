import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type PlanList } from '../types'

type GetPlansDTO = {
  projectId: string
  offset?: number
  limit?: number
  name?: string
}

export const GetPlans = ({
  projectId,
  offset,
  limit,
  name,
}: GetPlansDTO): Promise<PlanList> => {
  return axios.get(`/api/priceplan/allplans`, {
    params: {
      project_id: projectId,
      offset,
      limit,
      name,
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
  name,
  config,
}: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['plans', projectId, offset, limit, name],
    queryFn: () => GetPlans({ projectId, offset, limit, name }),
    ...config,
  })
}
