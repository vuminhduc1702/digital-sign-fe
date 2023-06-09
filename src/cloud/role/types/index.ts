import { type BasePagination } from '~/types'

type PolicyResources =
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

type PolicyActions = 'read' | 'create' | 'modify' | 'delete'

export type ResourcesType = {
  value: PolicyResources
  label: string
}

export type ActionsType = {
  value: PolicyActions
  label: string
}

export type Role = {
  id: string
  owner: string
  project_id: string
  name: string
  policies: Policies[]
}

export type Policies = {
  policy_name: string
  resources: ResourcesType[]
  actions: ActionsType[]
}

export type RoleList = {
  roles: Role[]
} & BasePagination
