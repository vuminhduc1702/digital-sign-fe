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
}

export type GetFirmWareRes = {
  data: FirmWare[]
} & BaseAPIRes &
  BasePagination

export const getFirmwares = ({
  projectId,
  offset,
  limit,
}: GetFirmWares): Promise<GetFirmWareRes> => {
  return axios.get(`/api/ota`, {
    params: {
      project_id: projectId,
      offset,
      limit,
    },
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
}: UseEntityFirmWareOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['firm-ware', projectId, offset, limit],
    queryFn: () => getFirmwares({ projectId, offset, limit }),
    ...config,
  })
}
