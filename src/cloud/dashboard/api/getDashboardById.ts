import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import type ReactGridLayout from 'react-grid-layout'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Widget } from '../components/Widget'

export type DashboardByIdRes = {
  id: string
  name: string
  created_time: number
  title: string
  tenant_id: string
  configuration: {
    description: string
    widgets: Widget &
      Partial<
        Record<
          keyof Widget,
          {
            id: string
          }
        >
      >
  }
  dashboard_setting: {
    layout: ReactGridLayout.Layout[]
  }
}

type GetDashboardById = {
  id: string
}

export const getDashboardsById = ({
  id,
}: GetDashboardById): Promise<DashboardByIdRes> => {
  return axios.get(`/api/vtdashboard/${id}`)
}

type QueryFnType = typeof getDashboardsById

type UseDashboardOptions = {
  config?: QueryConfig<QueryFnType>
} & GetDashboardById

export const useGetDashboardsById = ({ id, config }: UseDashboardOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['dashboardsById', id],
    queryFn: () => getDashboardsById({ id }),
    ...config,
  })
}
