import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type EntityType } from './createAttr'
import { type Attribute } from '~/types'

type AttrRes = {
  entity_type: EntityType
  entity_id: string
} & Attribute

type AttrsRes = {
  attributes: AttrRes[]
}

export const getAttrs = ({
  entityType,
  entityId,
  key,
}: {
  entityType: EntityType
  entityId: string
  key?: string
}): Promise<AttrsRes> => {
  return axios.get(`/api/attributes/${entityType}/${entityId}/values`, {
    params: { key },
  })
}

type QueryFnType = typeof getAttrs

type UseAttrsOptions = {
  entityType: EntityType
  entityId: string
  key?: string
  config?: QueryConfig<QueryFnType>
}

export const useGetAttrs = ({
  entityType,
  entityId,
  key,
  config,
}: UseAttrsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['attr', entityType, entityId, key],
    queryFn: () => getAttrs({ entityType, entityId, key }),
    ...config,
  })
}
