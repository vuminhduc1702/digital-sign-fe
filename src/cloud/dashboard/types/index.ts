export type ValueWS = { ts: number; value: string }

export type WSAgg = { label: string; value: WSAggValue }

export type WSAggValue = 'NONE' | 'AVG' | 'MIN' | 'MAX' | 'SUM' | 'COUNT'

type EntityId = {
  entityType: 'DEVICE'
  id: string
}

type LatestData = {
  TIME_SERIES: {
    [key: string]: {
      ts: number
      value: string
    }
  }
  ENTITY_FIELD: {
    name: {
      ts: number
      value: string
    }
  }
}

type AggLatestData = {
  TIME_SERIES: null
  ENTITY_FIELD: null
}

type DataItem = {
  entityId: EntityId
  latest: LatestData
  timeseries: null
  aggLatest: AggLatestData
}

export type WS = {
  data: DataItem[]
}
