/* eslint-disable @typescript-eslint/consistent-type-imports */
import * as z from 'zod'
import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type widgetSchema } from '../components/DashboardTable'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

export type Widget = z.infer<typeof widgetSchema>

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
