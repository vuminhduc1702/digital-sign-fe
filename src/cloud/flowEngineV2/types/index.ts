import type { Attribute, BaseEntity, BasePagination } from '~/types'


export type ProtocolType = 'mqtt' | 'tcp' | 'udp'
export type ContentType = 'json' | 'hex' | 'text'
export type Adapter = {
  id: string
  name: string
  owner: string
  project_id: string
  protocol: ProtocolType
  host: string
  port: string
  password: string
  topic: string[] | null
  content_type: ContentType
  created_time: number
  thing_id: string
  handle_service: string
}

export type AdapterList = {
  adapters: Adapter[]
} & BasePagination

export type OutputType =
  | 'json'
  | 'str'
  | 'i32'
  | 'i64'
  | 'f32'
  | 'f64'
  | 'bool'
  | 'time'
  | 'bin'
export const inputService = [
  {
    name: 'payload',
    type: 'str',
  },
  {
    name: 'entityInfo',
    type: 'str',
  },
]
export type Service = {
  id: string
  name: string
  description: string | null
  input: typeof inputService
  output: OutputType
  code: string
  create_ts: string
  update_ts: string | null
}

export type EntityThingType = 'thing' | 'template' | 'shape'
export type EntityThing = {
  id: string
  name: string
  type: 'Thing' | 'Template' | 'Shape'
  project_id: string
  create_ts: string
  description: string
  template_name: string
  base_template?: string
  base_shapes?: string
  total_service: number
}

export type EntityThingList = {
  list: EntityThing[]
} & BasePagination

export type ThingService = {
  id: string
  name: string
  create_ts: string
  description: string
}

export type ThingServiceList = {
  data: ThingService[]
} & BasePagination

export type Device = {
  key: string
  token: string
  template_id?: string
  name: string
  group_id?: string
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