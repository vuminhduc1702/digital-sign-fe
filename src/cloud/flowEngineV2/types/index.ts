import type { BasePagination } from '~/types'

export type ThingService = {
  id: string
  name: string
  create_ts: string
  description: string
}

export type ThingServiceList = {
  data: ThingService[]
} & BasePagination
