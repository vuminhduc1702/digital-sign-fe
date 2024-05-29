import { type BasePagination } from '@/types'
import { type AttrList } from '@/utils/schemaValidation'

export type TransportConfigAttribute = {
  action: string
  id: string
  kind: string
  name: string
  type: string
}

export type AttrLwM2MList = {
  attribute_key: string
  value: string | undefined
  logged: boolean
  value_t: string
}

export type ModuleConfig = {
  Observe?: boolean
  attribute_info: TransportConfigAttribute[]
  attributes: AttrLwM2MList[]
  last_update_ts: number
  id: string
  module_name: string
  numberOfAttributes: number
  allcheckbox?: boolean
}

export type TransportConfigInfo = {
  module_config: ModuleConfig[]
}

export type TransportConfig = {
  protocol: string
  config?: { [key: string]: string | null }
  info?: TransportConfigInfo
}

export type TemplateLwM2M = {
  id: string
  name: string
  rule_chain_id: string
  provision_key: string
  provision_secret: string
  created_time: number
  transport_config: TransportConfig
}

export type Template = {
  handle_service: any
  id: string
  name: string
  rule_chain_id: string
  provision_key: string
  provision_secret: string
  created_time: number
  transport_config: TransportConfig
  attributes: AttrList
  thing_id: string
  thing_name: string
  handle_message_svc: string
}
export type TemplateLwM2MList = {
  templates: TemplateLwM2M[]
} & BasePagination

export type TemplateList = {
  templates: Template[]
} & BasePagination

export type RuleChain = {
  id: {
    entityType: string
    id: string
  }
  name: string
}

export type RulechainList = {
  data: RuleChain[]
  totalPages: number
  totalElements: number
  hasNext: boolean
}

export type LwM2M = {
  file_id: string
  module_name: string
  version: string
}

export type LwM2MList = {
  infos: LwM2M[]
  bucket_name: 'publishxml'
  number_of_files: 324
}
export type ResourceItem = {
  '@ID': string
  Name: string
  Operations: string
  MultipleInstances: string
  Mandatory: string
  Type: string
  RangeEnumeration?: string | null
  Units?: string | null
  Description: string
}

export type Resources = {
  Item: ResourceItem[]
}

export type ObjectDefinition = {
  '@ObjectType': string
  Name: string
  Description1: string
  ObjectID: string
  ObjectURN: string
  LWM2MVersion: string
  ObjectVersion: string
  MultipleInstances: string
  Mandatory: string
  Resources: Resources
  Description2: string | null
}

export type LWM2MData = {
  '@xmlns:xsi': string
  '@xsi:noNamespaceSchemaLocation': string
  Object: ObjectDefinition
}

export type LWM2MResponse = {
  LWM2M: LWM2MData
}
