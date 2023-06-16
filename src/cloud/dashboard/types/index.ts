export type ValueWS = { ts: number; value: string }

export type WSAgg = { label: string; value: WSAggValue }

export type WSAggValue = 'NONE' | 'AVG' | 'MIN' | 'MAX' | 'SUM' | 'COUNT'

type EntityId = {
  entityType: 'DEVICE'
  id: string
}

type LatestData = {
  TIME_SERIES: {
    [key: string]: ValueWS
  } | null
  ENTITY_FIELD: {
    name: ValueWS
  } | null
}

type AggLatestData = {
  TIME_SERIES: null
  ENTITY_FIELD: null
}

type TimeSeries = {
  [key: string]: ValueWS[]
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
