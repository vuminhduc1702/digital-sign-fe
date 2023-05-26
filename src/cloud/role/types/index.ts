import { type BasePagination } from '~/types'

export type PolicyResources =
  | 'users'
  | 'groups'
  | 'templates'
  | 'events'
  | 'organizations'
  | 'roles'
  | 'projects'
  | 'devices'

export type PolicyActions = 'read' | 'write' | 'modify' | 'delete'

export type Role = {
  id: string
  owner: string
  project_id: string
  name: string
  policies: Policies[]
}

export type Policies = {
  policy_name: string
  resources: PolicyResources[]
  actions: PolicyActions[]
}

export type RoleList = {
  roles: Role[]
} & BasePagination
