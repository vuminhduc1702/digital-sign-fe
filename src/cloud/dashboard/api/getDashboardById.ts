import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { Dashboard } from '../types'

type GetDashboardById = {
  id: string
}

export const getDashboardsById = ({
  id
}: GetDashboardById): Promise<Dashboard> => {
  return axios.get(`/api/vtdashboard/${id}`)
}

type QueryFnType = typeof getDashboardsById

type UseDashboardOptions = {
  config?: QueryConfig<QueryFnType>
} & GetDashboardById

export const useGetDashboardsById = ({
  id,
  config,
}: UseDashboardOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['dashboardsById', id],
    queryFn: () => getDashboardsById({ id }),
    ...config,
  })
}
