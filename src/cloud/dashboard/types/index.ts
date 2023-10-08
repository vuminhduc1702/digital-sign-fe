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

type TimeSeries = {
  [key: string]: WSWidgetData[]
}

type DataItem = {
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

export const dataTest = [
  {
    ts: 1696178540,
    value: 1,
  },
  {
    ts: 1696351340,
    value: 2,
  },
  {
    ts: 1696524140,
    value: 3,
  },
  {
    ts: 1696696940,
    value: 4,
  },
]
