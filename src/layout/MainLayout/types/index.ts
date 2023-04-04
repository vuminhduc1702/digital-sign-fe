export type Project = {
  id: string
  name: string
  image?: string
  description: string
  app_key: string
  app_secret: string
  sms_config: {
    type?: string
    config?: any | null
    content?: string
    reset_password_content?: string
  }
}

export type Org = {
  id: string
  name: string
  image?: string
  description: string
  org_id?: string
  group_id?: string
  project_id: string
  attributes: {
    attribute_type: string
    attribute_key: string
    logged: boolean
    value: string | number | boolean
    value_as_string: string
    last_update_ts: number
    value_type: string
  }
}

export type OrgAttr = {
  id: string
  attribute_type: string
  attribute_key: string
  entity_id: string
  entity_type: string
  logged: boolean
  value: string | number | boolean
  value_as_string: string
  last_update_ts: number
  value_type: string
}
