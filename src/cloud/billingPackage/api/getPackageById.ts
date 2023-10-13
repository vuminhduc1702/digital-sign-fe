import { useQuery } from '@tanstack/react-query'

import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type PlanById } from '../types'

export const getPlanById = ({
  planId,
}: {
  planId: string
}): Promise<PlanById> => {
  return axios.get(`/api/priceplan/plan/${planId}`)
}

type QueryFnType = typeof getPlanById

type UsePlanByIdOptions = {
  planId: string
  config?: QueryConfig<QueryFnType>
}

export const usePlanById = ({
  planId,
  config,
}: UsePlanByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['planById', planId],
    queryFn: () => getPlanById({ planId }),
    enabled: !!planId,
    ...config,
  })
}
