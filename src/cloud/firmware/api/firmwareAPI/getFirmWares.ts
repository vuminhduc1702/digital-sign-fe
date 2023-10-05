import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type BasePagination, type BaseAPIRes } from '~/types'
import { type FirmWare } from '../../types'

type GetFirmWares = {
  projectId: string
}

export type GetFirmWareRes = {
  data: FirmWare[]
} & BaseAPIRes & BasePagination

export const getFirmwares = ({
  projectId,
}: GetFirmWares): Promise<GetFirmWareRes> => {
  return axios.get(`/api/ota`, {
    params: {
      project_id: projectId
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
}: UseEntityFirmWareOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['firm-ware', projectId],
    queryFn: () => getFirmwares({ projectId }),
    ...config,
  })
}
