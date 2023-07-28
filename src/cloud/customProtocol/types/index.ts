import { type BasePagination } from '~/types'

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
export type Service = {
  id: string
  name: string
  description: string | null
  input: [
    {
      name: 'payload'
      type: 'str'
    },
    {
      name: 'entityInfo'
      type: 'str'
    },
  ]
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
  description?: string
  base_template?: string
  base_shapes?: string
}

export type EntityThingList = {
  list: EntityThing[]
} & BasePagination
