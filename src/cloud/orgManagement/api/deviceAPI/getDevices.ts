import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type DeviceList, type Device } from '../../types'

type GetDevices = {
  orgId?: string
  orgIds?: string[]
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
  orgIds,
  projectId,
  get_attributes = false,
  offset = 0,
  limit = limitPagination,
  config,
}: UseDeviceOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      'devices',
      orgId,
      orgIds,
      projectId,
      offset,
      limit,
      get_attributes,
    ],
    queryFn: () => {
      const res = {
        devices: [] as Device[],
        limit: 0,
        offset: 0,
        total: 0,
      }
      if (orgIds && orgIds.length > 0) {
        orgIds?.forEach(async orgId => {
          const orgDevice = await getDevices({
            orgId,
            projectId,
            get_attributes,
            offset,
            limit,
          })
          res.devices = [...res.devices, ...orgDevice.devices]
          res.limit = orgDevice.limit
          res.offset = orgDevice.offset
          res.total += orgDevice.total
        })

        return res
      }

      return getDevices({ orgId, projectId, offset, limit, get_attributes })
    },
    ...config,
  })
}
