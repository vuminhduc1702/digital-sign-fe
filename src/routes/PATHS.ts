export const BASE_PATH = '/cloud/'

export const PATHS: { [key: string]: string } = {
  ORG_INFO: `${BASE_PATH}org-management/org-info`,
  GROUP_MANAGE: `${BASE_PATH}org-management/group-manage`,
  USER_MANAGE: `${BASE_PATH}org-management/user-manage`,
  DEVICE_MANAGE: `${BASE_PATH}org-management/device-manage`,
  EVENT_MANAGE: `${BASE_PATH}org-management/event-manage`,
  ROLE_MANAGE: `${BASE_PATH}org-management/role-manage`,

  DEVICE_TEMPLATE: `${BASE_PATH}device-template`,
  FLOW_ENGINE: `${BASE_PATH}flow-engine`,
  DASHBOARD: `${BASE_PATH}dashboard`,

  NOTFOUND: `${BASE_PATH}*`,
  MAINTAIN: `${BASE_PATH}maintain`,
}
