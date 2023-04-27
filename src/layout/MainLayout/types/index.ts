import { type Attribute, type BasePagination } from '~/types'

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

export type ProjectList = {
  projects: Project[]
} & BasePagination

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

export type OrgList = {
  organizations: Org[]
} & BasePagination
