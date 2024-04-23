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
  search_str?: string
  search_field?: string
}

export type GetEntityThingsRes = {
  data: EntityThingList
} & BaseAPIRes

export const getEntityThings = ({
  projectId,
  type,
  offset,
  limit,
  search_str,
  search_field,
}: GetEntityThings): Promise<GetEntityThingsRes> => {
  return axios.get(`/api/fe/thing`, {
    params: {
      project_id: projectId,
      type,
      share: true,
      offset,
      limit,
      search_str,
      search_field,
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
  search_str,
  search_field,
  config,
}: UseEntityThingsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      'entity-things',
      projectId,
      type,
      offset,
      limit,
      search_str,
      search_field,
    ],
    queryFn: () =>
      getEntityThings({
        projectId,
        type,
        offset,
        limit,
        search_str,
        search_field,
      }),
    ...config,
  })
}
