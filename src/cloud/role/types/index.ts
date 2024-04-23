import { type BasePagination } from '@/types'

export type PolicyResources =
  | 'groups'
  | 'devices'
  | 'devicetokens'
  | 'events'
  | 'eventaction'
  | 'users'
  | 'roles'
  | 'projects'
  | 'organizations'
  | 'templates'
  | 'pricing'

export type PolicyActions = 'read' | 'create' | 'modify' | 'delete'

export type Role = {
  id: string
  owner: string
  project_id: string
  name: string
  policies: Policies[]
  role_type: string
}

export type Policies = {
  policy_name: string
  resources: PolicyResources[]
  actions: PolicyActions[]
  devices: string[]
  users: string[]
  orgs: string[]
  events: string[]
}

export type RoleList = {
  roles: Role[]
} & BasePagination
