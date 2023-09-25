import { type Attribute, type BasePagination } from '~/types'

export type Org = {
  id: string
  name: string
  image: string
  description: string
  group_id?: string
  org_id: string
  project_id: string
  level: number
  parent_name: string
  sub_orgs?: Org[]
  attributes: Attribute[]
}

export type OrgList = {
  organizations: Org[]
} & BasePagination
