import * as z from 'zod'

export type WSWidgetData = { ts: number; value: string }

export type WidgetType = 'TIMESERIES' | 'LASTEST'

type EntityId = {
  entityType: 'DEVICE'
  id: string
}

type LatestData = {
  TIME_SERIES: {
    [key: string]: WSWidgetData
  } | null
  ENTITY_FIELD: {
    name: WSWidgetData
  } | null
}

type AggLatestData = {
  TIME_SERIES: null
  ENTITY_FIELD: null
}

export type TimeSeries = {
  [key: string]: WSWidgetData[]
}

export type DataItem = {
  entityId: EntityId
  latest: LatestData
  timeseries: TimeSeries | null
  aggLatest: AggLatestData
}

export type DashboardWS = {
  data: DataItem[]
}

export const aggSchema = z.enum([
  'NONE',
  'AVG',
  'MIN',
  'MAX',
  'SUM',
  'COUNT',
] as const)
