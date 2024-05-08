import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type DeviceList, type Device } from '../../types'

type GetDevices = {
  orgId?: string
  orgIds?: string[]
  projectId: string
  get_attributes?: boolean
  offset?: number
  limit?: number
  search_str?: string
  search_field?: string
}

export const getDevices = ({
  orgId,
  projectId,
  get_attributes,
  offset,
  limit,
  search_str,
  search_field,
}: GetDevices): Promise<DeviceList> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    org_id: orgId || '',
    project_id: projectId,
    get_attributes: String(get_attributes),
    offset: String(offset),
    limit: String(limit),
    search_str: search_str || '',
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })
  return axios.get(`/api/devices`, {
    params,
    // : {
    //   org_id: orgId,
    //   project_id: projectId,
    //   offset,
    //   limit,
    //   get_attributes,
    //   search_str,
    //   search_field,
    // },
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
  search_str,
  search_field,
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
      search_str,
      search_field,
    ],
    queryFn: () => {
      return getDevices({
        orgId,
        projectId,
        offset,
        limit,
        get_attributes,
        search_str,
        search_field,
      })
    },
    ...config,
  })
}
