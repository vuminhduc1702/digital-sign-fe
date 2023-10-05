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

export type WS = {
  data: DataItem[]
}
