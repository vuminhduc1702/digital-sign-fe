import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type BasePagination } from '~/types'

export type DashboardRes = {
  id: string
  name: string
  created_time: number
  title: string
  tenant_id: string
  configuration: {
    description: string
    widgets: null
  }
}

export type DashboardList = {
  dashboard: DashboardRes[]
} & BasePagination

type GetDashboards = {
  projectId: string
  offset?: number
  limit?: number
}

export const getDashboards = ({
  projectId,
  offset,
  limit,
}: GetDashboards): Promise<DashboardList> => {
  return axios.get(`/api/vtdashboard`, {
    params: {
      project_id: projectId,
      offset,
      limit,
    },
  })
}

type QueryFnType = typeof getDashboards

type UseDashboardOptions = {
  config?: QueryConfig<QueryFnType>
} & GetDashboards

export const useGetDashboards = ({
  projectId,
  offset = 0,
  limit = limitPagination,
  config,
}: UseDashboardOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['dashboards', projectId, offset, limit],
    queryFn: () => getDashboards({ projectId, offset, limit }),
    ...config,
  })
}
