import type { BaseAPIRes, BasePagination } from '~/types'

export type ThingService = {
  id: string
  name: string
  create_ts: string
  description: string
} & BodyEventService

export type ThingServiceList = {
  data: ThingService[]
} & BasePagination

export type BodyEventService = {
  input?: any
  output?: any
}

export type EventService = {
  id: string
  service: string
  entity_id: string
  status: string
  ts: number
  body: BodyEventService
}

export type InputService = {
  name: string
  type: string
}

export type EventServiceList = {
  data: EventService[]
} & BaseAPIRes
