import { useQuery } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

import { type EntityType } from './createAttr'
import { type BasePagination } from '~/types'

export type DeviceAttrLog = {
  entity_type: EntityType
  entity_id: string
  attribute_key: string
  value: string | number | boolean
  ts: number
  value_type: 'STR' | 'BOOL' | 'LONG' | 'DBL' | 'JSON'
}

export type DeviceAttrLogList = {
  logs: DeviceAttrLog[]
} & BasePagination

export const getAttrLog = ({
  entityId,
  entityType,
  limit = 100,
}: {
  entityId: string
  entityType: EntityType
  limit?: number
}): Promise<DeviceAttrLogList> => {
  return axios.get(`/api/attributes/logged/${entityType}/${entityId}/values`, {
    params: { limit },
  })
}

type QueryFnType = typeof getAttrLog

type UseAttrLogOptions = {
  entityId: string
  entityType: EntityType
  config?: QueryConfig<QueryFnType>
}

export const useAttrLog = ({
  entityId,
  entityType,
  config,
}: UseAttrLogOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['attrLog', entityId, entityType],
    queryFn: () => getAttrLog({ entityId, entityType }),
    ...config,
  })
}
