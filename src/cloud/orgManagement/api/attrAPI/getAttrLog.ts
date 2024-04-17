import { useQuery } from '@tanstack/react-query'

import { axios } from '@/lib/axios'
import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type EntityType } from './createAttr'
import { type BasePagination } from '@/types'

export type DeviceAttrLog = {
  entity_type: EntityType
  entity_id: string
  attribute_key: string
  value: string | number | boolean
  unit: string
  ts: number
  value_type: 'STR' | 'BOOL' | 'LONG' | 'DBL' | 'JSON'
}

export type DeviceAttrLogList = {
  logs: DeviceAttrLog[]
} & BasePagination

export const getAttrLog = ({
  entityId,
  entityType,
  offset,
  limit = limitPagination,
}: {
  entityId: string
  entityType: EntityType
  offset?: number
  limit?: number
}): Promise<DeviceAttrLogList> => {
  return axios.get(`/api/attributes/logged/${entityType}/${entityId}/values`, {
    params: { offset, limit },
  })
}

type QueryFnType = typeof getAttrLog

type UseAttrLogOptions = {
  entityId: string
  entityType: EntityType
  offset?: number
  limit?: number
  config?: QueryConfig<QueryFnType>
}

export const useAttrLog = ({
  entityId,
  entityType,
  offset = 0,
  limit,
  config,
}: UseAttrLogOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['attrLog', entityId, entityType, offset, limit],
    queryFn: () => getAttrLog({ entityId, entityType, offset, limit }),
    ...config,
  })
}
