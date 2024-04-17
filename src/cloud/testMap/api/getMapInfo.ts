import { useQuery } from '@tanstack/react-query'

import { axios } from '@/lib/axios'
import {
  queryClient,
  type ExtractFnReturnType,
  type QueryConfig,
} from '@/lib/react-query'
import { toast } from 'sonner'

import { type MapInfo } from './../types'

type GetMapInfoRes = {
  devices: MapInfo[]
  limit: number
  offset: number
  total: number
}

type MapInfoProps = {
  id: string
  offset: number
  expand?: boolean
  typeId?: string
}

export const getMapInfo = ({
  id,
  offset,
  expand = true,
  typeId = 'Lorawan',
}: MapInfoProps): Promise<GetMapInfoRes> => {
  return axios.get(`/api/devices/streetlight`, {
    params: {
      project_id: id,
      expand: expand,
      type_id: typeId,
      offset: offset,
    },
  })
}

type QueryFnType = typeof getMapInfo

type UseGetMapInfoOptions = {
  config?: QueryConfig<QueryFnType>
} & MapInfoProps

export const useGetMapInfo = ({
  id,
  offset,
  expand,
  typeId,
  config,
}: UseGetMapInfoOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['mapInfo', id, offset, expand, typeId],
    queryFn: () => getMapInfo({ id, offset, expand, typeId }),
    ...config,
  })
}
