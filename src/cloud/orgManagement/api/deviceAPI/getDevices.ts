import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type DeviceList } from '../../types'

type GetDevices = {
  orgId?: string
  projectId: string
  get_attributes?: boolean
  offset?: number
  limit?: number
}

export const getDevices = ({
  orgId,
  projectId,
  get_attributes,
  offset,
  limit,
}: GetDevices): Promise<DeviceList> => {
  return axios.get(`/api/devices`, {
    params: {
      org_id: orgId,
      project_id: projectId,
      offset,
      limit,
      get_attributes,
    },
  })
}

type QueryFnType = typeof getDevices

type UseDeviceOptions = {
  config?: QueryConfig<QueryFnType>
} & GetDevices

export const useGetDevices = ({
  orgId,
  projectId,
  get_attributes = false,
  offset = 0,
  limit = limitPagination,
  config,
}: UseDeviceOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['devices', orgId, projectId, offset, limit, get_attributes],
    queryFn: () =>
      getDevices({ orgId, projectId, offset, limit, get_attributes }),
    ...config,
  })
}
