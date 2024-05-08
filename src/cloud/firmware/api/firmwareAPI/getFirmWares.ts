import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type BasePagination, type BaseAPIRes } from '@/types'
import { type FirmWare } from '../../types'
import { limitPagination } from '@/utils/const'

type GetFirmWares = {
  projectId: string
  offset?: number
  limit?: number
  search_field?: string
  search_str?: string
}

export type GetFirmWareRes = {
  data: FirmWare[]
} & BaseAPIRes &
  BasePagination

export const getFirmwares = ({
  projectId,
  offset,
  limit,
  search_field,
  search_str,
}: GetFirmWares): Promise<GetFirmWareRes> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    project_id: projectId,
    offset: String(offset),
    limit: String(limit),
    search_str: search_str || '',
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })
  return axios.get(`/api/ota`, {
    params,
    // : {
    //   project_id: projectId,
    //   offset,
    //   limit,
    //   search_field,
    //   search_str,
    // },
  })
}

type QueryFnType = typeof getFirmwares

type UseEntityFirmWareOptions = {
  config?: QueryConfig<QueryFnType>
} & GetFirmWares

export const useGetFirmwares = ({
  projectId,
  config,
  offset = 0,
  limit = limitPagination,
  search_field,
  search_str,
}: UseEntityFirmWareOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['firm-ware', projectId, offset, limit, search_field, search_str],
    queryFn: () =>
      getFirmwares({ projectId, offset, limit, search_field, search_str }),
    ...config,
  })
}
