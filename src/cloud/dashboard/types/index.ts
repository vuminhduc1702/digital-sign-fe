import * as z from 'zod'

import i18n from '~/i18n'

import { type BaseWSRes } from '~/types'

export type WSWidgetData = { ts: number; value: string }

export type WidgetType = 'TIMESERIES' | 'LASTEST'

export type EntityId = {
  entityType: 'DEVICE'
  entityName: string
  id: string
}

export type LatestData = {
  [key: string]: WSWidgetData
}

export type TimeSeries = {
  [key: string]: WSWidgetData[]
}

export type DataSeries = {
  data: TimeSeries
  device: EntityId[]
}

export type WSWidgetMapData = { id: string; name: string; value: string }

export type MapSeries = {
  data: TimeSeries
  device: WSWidgetMapData[]
}

export type DataItem = {
  entityId: EntityId
  latest: {
    TIME_SERIES: LatestData | null
    ENTITY_FIELD: {
      name: WSWidgetData
    } | null
  }
  timeseries: TimeSeries | null
  aggLatest: {
    TIME_SERIES: null
    ENTITY_FIELD: null
  }
  message?: string
}

export type DashboardWS = {
  data: DataItem[]
  id: string
  update: any[]
  requestType?: 'INIT' | 'REALTIME' | 'LASTEST' | 'HISTORY'
} & BaseWSRes

export const aggSchema = z.enum(
  ['NONE', 'AVG', 'MIN', 'MAX', 'SUM', 'COUNT', 'SMA', 'FFT'] as const,
  {
    errorMap: () => ({ message: i18n.t('ws:filter.choose_agg') }),
  },
)

export const widgetCategorySchema = z.enum([
  'LINE',
  'BAR',
  'PIE',
  'GAUGE',
  'CARD',
  'MAP',
  'TABLE',
  'CONTROLLER',
] as const)


