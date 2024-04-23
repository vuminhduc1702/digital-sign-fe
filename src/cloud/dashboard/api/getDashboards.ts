import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type BasePagination } from '@/types'

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
  dashboard_setting: {
    widgets: null
    last_viewed: string
    starred: boolean
  }
}

export type DashboardList = {
  dashboard: DashboardRes[]
} & BasePagination

type GetDashboards = {
  projectId: string
  offset?: number
  limit?: number
  search_field?: string
  search_str?: string
}

export const getDashboards = ({
  projectId,
  offset,
  limit,
  search_field,
  search_str,
}: GetDashboards): Promise<DashboardList> => {
  return axios.get(`/api/vtdashboard`, {
    params: {
      project_id: projectId,
      offset,
      limit,
      search_field,
      search_str,
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
  search_field,
  search_str,
  config,
}: UseDashboardOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      'dashboards',
      projectId,
      offset,
      limit,
      search_field,
      search_str,
    ],
    queryFn: () =>
      getDashboards({ projectId, offset, limit, search_field, search_str }),
    ...config,
  })
}
