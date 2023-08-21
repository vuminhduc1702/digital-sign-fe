import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

import { type EntityThingType, type EntityThingList } from '../../types'
import { type BaseAPIRes } from '~/types'

type GetEntityThings = {
  projectId: string
  type?: EntityThingType
}

export type GetEntityThingsRes = {
  data: EntityThingList
} & BaseAPIRes

export const getEntityThings = ({
  projectId,
  type,
}: GetEntityThings): Promise<GetEntityThingsRes> => {
  return axios.get(`/api/fe/thing`, {
    params: {
      project_id: projectId,
      type,
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
  config,
}: UseEntityThingsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['entity-things', projectId, type],
    queryFn: () => getEntityThings({ projectId, type }),
    ...config,
  })
}
