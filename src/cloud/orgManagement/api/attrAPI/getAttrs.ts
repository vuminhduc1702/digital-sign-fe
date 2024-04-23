import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type EntityType } from './createAttr'
import { type Attribute } from '@/types'

export type AttrRes = {
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
  key_search,
}: {
  entityType: EntityType
  entityId: string
  key?: string
  key_search?: string
}): Promise<AttrsRes> => {
  return axios.get(`/api/attributes/${entityType}/${entityId}/values`, {
    params: { key, key_search },
  })
}

type QueryFnType = typeof getAttrs

type UseAttrsOptions = {
  entityType: EntityType
  entityId: string
  key?: string
  key_search?: string
  config?: QueryConfig<QueryFnType>
}

export const useGetAttrs = ({
  entityType,
  entityId,
  key,
  key_search,
  config,
}: UseAttrsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['attrs', entityType, entityId, key, key_search],
    queryFn: () => getAttrs({ entityType, entityId, key, key_search }),
    enabled: !!entityId,
    ...config,
  })
}
