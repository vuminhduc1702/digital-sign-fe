import { type BasePagination } from '~/types'

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

export type Widget = {
  type: string
  title: string
  datasources: {
    [key: string]: string
  }
  config: {
    chartsetting: {
      [key: string]: string
    }
    timewindow: {
      interval: number
    }
    aggregation: {
      limit: number
    }
  }
}

export type Widgets = {
  [key: string]: Widget
}

export type Dashboard = {
  id: string
  name: string
  created_time: number
  title: string
  tenant_id: string
  configuration: {
    description: string
    widgets: Widgets | null
  }
}

export type DashboardList = {
  dashboard: Dashboard[]
} & BasePagination
