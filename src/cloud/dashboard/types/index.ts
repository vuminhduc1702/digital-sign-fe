import { type BasePagination } from '~/types'

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

export type Widget = {
  type: WidgetType
  title: string
  datasource: {
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
    widgets: Widgets
  }
}

export type DashboardList = {
  dashboard: Dashboard[]
} & BasePagination
