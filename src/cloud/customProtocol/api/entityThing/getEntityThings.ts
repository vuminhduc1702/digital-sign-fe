import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'

import { type EntityThingType, type EntityThingList } from '../../types'
import { type BaseAPIRes } from '@/types'
import { limitPagination } from '@/utils/const'

type GetEntityThings = {
  projectId: string
  type?: EntityThingType
  offset?: number
  limit?: number
}

export type GetEntityThingsRes = {
  data: EntityThingList
} & BaseAPIRes

export const getEntityThings = ({
  projectId,
  type,
  offset,
  limit,
}: GetEntityThings): Promise<GetEntityThingsRes> => {
  return axios.get(`/api/fe/thing`, {
    params: {
      project_id: projectId,
      type,
      share: true,
      offset,
      limit,
    },
  })
}

type QueryFnType = typeof getEntityThings

type UseEntityThingsOptions = {
  config?: QueryConfig<QueryFnType>
} & GetEntityThings

export const useGetEntityThings = ({
  projectId,
  type,
  offset = 0,
  limit = limitPagination,
  config,
}: UseEntityThingsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['entity-things', projectId, type, offset, limit],
    queryFn: () => getEntityThings({ projectId, type, offset, limit }),
    ...config,
  })
}
