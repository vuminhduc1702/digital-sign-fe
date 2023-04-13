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
  group_id?: string
  org_id?: string
  project_id: string
  level: number
  sub_orgs?: Org[]
  attributes: Attribute[]
}

export type Attribute = {
  // id: string
  attribute_key: string
  attribute_type: string
  logged: boolean
  value: string | number | boolean
  value_as_string?: string
  last_update_ts: number
  value_type: 'STR' | 'BOOL' | 'LONG' | 'DBL' | 'JSON'
}

export type OrgList = {
  total: number
  offset: number
  limit: number
  organizations: Org[]
}
