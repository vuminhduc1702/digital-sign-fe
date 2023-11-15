export type BillingCustomerEntity = {
  identity: string
  name: string
  phone: string
  email: string
  system_role: string
  company: string
  id: string
  permissions: Array<{}>
}

export type CustomerRoleEntity = {
  permissions: Array<{}>
  project_id: string
  role_id: string
}
