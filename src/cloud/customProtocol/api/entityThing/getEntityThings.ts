import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

import { type EntityThingType, type EntityThingList } from '../../types'
import { type BaseAPIRes } from '~/types'

type GetEntityThings = {
  projectId: string
  entityThingType?: EntityThingType
}

type GetEntityThingsRes = {
  data: EntityThingList
} & BaseAPIRes

export const getEntityThings = ({
  projectId,
  entityThingType,
}: GetEntityThings): Promise<GetEntityThingsRes> => {
  return axios.get(`/api/fe/thing`, {
    params: {
      project_id: projectId,
      entityThingType,
    },
  })
}

type QueryFnType = typeof getEntityThings

type UseEntityThingsOptions = {
  config?: QueryConfig<QueryFnType>
} & GetEntityThings

export const useGetEntityThings = ({
  projectId,
  entityThingType,
  config,
}: UseEntityThingsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['entity-things', projectId, entityThingType],
    queryFn: () => getEntityThings({ projectId, entityThingType }),
    ...config,
  })
}
