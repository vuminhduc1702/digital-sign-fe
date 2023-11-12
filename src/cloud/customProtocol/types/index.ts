import { type BasePagination } from '~/types'

export type ProtocolType = 'mqtt' | 'tcp' | 'udp'
export type ContentType = 'json' | 'hex' | 'text'
export type Configuration = {
  credentials: {
    username: string
    password: string
  }
  topic_filters: {
    topic: string
  }[]
}

export type FieldsType = {
  name: string
  start_byte: number
  end_byte: number
}

export type SchemaType = {
  fields: FieldsType[]
}
export type Adapter = {
  id: string
  name: string
  owner: string
  project_id: string
  protocol: ProtocolType
  host: string
  port: string
  configuration: Configuration
  content_type: ContentType
  created_time: number
  thing_id: string
  handle_service: string
  schema: SchemaType
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
  {
    name: 'msg',
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

export type EntityThingType = 'Thing' | 'Template' | 'Shape'
export type EntityThing = {
  id: string
  name: string
  type: EntityThingType
  project_id: string
  create_ts: string
  description: string
  base_template?: string
  base_shapes?: string
  total_service: number
  template_name: string
}

export type EntityThingList = {
  list: EntityThing[]
} & BasePagination
