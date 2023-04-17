import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type Attribute } from '~/layout/MainLayout/types'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type EntityType } from './createAttr'

type AttrRes = {
  entity_type: EntityType
  entity_id: string
} & Attribute

export const getAttr = ({
  entityType,
  entityId,
  attrKey,
}: {
  entityType: EntityType
  entityId?: string
  attrKey?: string
}): Promise<AttrRes> => {
  return axios.get(
    `/api/attributes/${entityType}/${entityId}/SCOPE_CLIENT/${attrKey}/values`,
  )
}

type QueryFnType = typeof getAttr

type UseAttrOptions = {
  entityType: EntityType
  entityId?: string
  attrKey?: string
  config?: QueryConfig<QueryFnType>
}

export const useGetAttr = ({
  entityType,
  entityId,
  attrKey,
  config,
}: UseAttrOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['attr', entityType, entityId, attrKey],
    queryFn: () => getAttr({ entityType, entityId, attrKey }),
    ...config,
  })
}
