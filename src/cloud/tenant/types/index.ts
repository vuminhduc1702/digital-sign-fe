export type BillingCustomerEntity = {
  identity: string
  name: string
  phone: string
  email: string
  system_role: string
  company: string
  id: string
  permissions: Array<PermissionEntity>
}

export type CustomerRoleEntity = {
  permissions: Array<PermissionEntity>
}

export type PermissionEntity = {
  project_id: string
  role_id: string
}

export type PermissionEntityTable = {
  stt: number
  project_id: string
  role_id: string
  contextMenu: any
}

export type TenantList = {
  limit: number
  offset: number
  tenant: Array<BillingCustomerEntity>
  total: number 
}
