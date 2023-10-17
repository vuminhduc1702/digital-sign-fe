import type { Attribute, BaseEntity, BasePagination } from '~/types'
import { type EntityType } from '../api/attrAPI'

// Device types

export type Device = {
  key: string
  token: string
  template_id: string
  name: string
  group_id: string
  group_name: string
  org_id: string
  org_name: string
  template_name: string
  status: 'offline' | 'online' | 'block'
  additional_info: {
    device_id?: string
    imei?: string
    device_manufacture?: string
    protocol?: string
    heartbeat_interval: number
    last_heartbeat: number
    timeout_lifecycle: number
    device_model?: string
  }
  attributes: Attribute[]
} & BaseEntity

export type DeviceList = {
  devices: Device[]
} & BasePagination

// Group types

export type Group = {
  id: string
  name: string
  organization: string
  org_name: string
  project_id: string
  entity_type: Omit<EntityType, 'GROUP' | 'TEMPLATE'>
  attributes: Attribute[]
  parent_name?: string
}

export type GroupList = {
  groups: Group[]
} & BasePagination

// Event types

export type ActionType =
  | 'sms'
  | 'email'
  | 'mqtt'
  | 'fcm'
  | 'event'
  | 'eventactive'
  | 'delay'

export type Action = {
  receiver: string
} & (
  | {
      action_type: 'email'
      subject: string
      message: string
    }
  | {
      action_type: 'eventactive'
      subject?: string
      message?: string
    }
  | {
      action_type: Exclude<ActionType, 'email' | 'eventactive'>
      subject?: string
      message: string
    }
)

export type Condition = {
  device_id: string
  device_name: string
  attribute_name: string
  condition_type: 'normal' | 'delay'
  operator: '<' | '>' | '!='
  threshold: string
  logical_operator: 'and' | 'or'
}

export type EventType = {
  id: string
  owner: string
  name: string
  project_id: string
  org_id: string
  group_id: string
  group_name: string
  jobs: null
  interval: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
    start_time: string
    end_time: string
  }
  action: Action[]
  status: boolean
  created_by: string
  metadata: null
  retry: number
} & (
  | {
      onClick: false
      condition: Condition[]
      schedule: null
    }
  | {
      onClick: false
      condition: null
      schedule: {
        time: string
        repeat?: string
      }
    }
  | {
      onClick: true
      condition: null
      schedule: null
    }
)

export type EventList = {
  events: EventType[]
}
