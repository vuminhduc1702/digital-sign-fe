import { useQuery } from '@tanstack/react-query'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Device } from '../../types'
import { getDevices } from './getDevices'

type GetDevicesMultiOrg = {
  orgIds: string[]
  projectId: string
  get_attributes?: boolean
  offset?: number
  limit?: number
}

type QueryFnType = typeof getDevices

type UseDeviceOptionsMultiOrg = {
  config?: QueryConfig<QueryFnType>
} & GetDevicesMultiOrg

export const useGetDevicesMultiOrg = ({
  orgIds,
  projectId,
  get_attributes = true,
  offset = 0,
  limit = limitPagination,
  config,
}: UseDeviceOptionsMultiOrg) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      'devicesMultiOrg',
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
      orgIds.forEach(async orgId => {
        const result = await getDevices({
          orgId,
          projectId,
          get_attributes,
          offset,
          limit,
        })
        res.devices = [...res.devices, ...result.devices]
        res.limit = result.limit
        res.offset = result.offset
        res.total += result.total
      })
      return res
    },
    ...config,
  })
}