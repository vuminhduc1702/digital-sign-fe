export const BASE_PATH = '/'
export const BASE_PATH_CLOUD = '/cloud/'

export const PATHS: { [key: string]: string } = {
  HOME: `${BASE_PATH}`,
  ORG_MANAGEMENT: `${BASE_PATH_CLOUD}org-management`,
  ORG_MANAGE: `${BASE_PATH_CLOUD}org-management/org`,
  GROUP_MANAGE: `${BASE_PATH_CLOUD}org-management/group`,
  USER_MANAGE: `${BASE_PATH_CLOUD}org-management/user`,
  DEVICE_MANAGE: `${BASE_PATH_CLOUD}org-management/device`,
  EVENT_MANAGE: `${BASE_PATH_CLOUD}org-management/event`,

  DEVICE_TEMPLATE: `${BASE_PATH_CLOUD}device-template`,
  FLOW_ENGINE: `${BASE_PATH_CLOUD}flow-engine`,
  DASHBOARD: `${BASE_PATH_CLOUD}dashboard`,
  ROLE_MANAGE: `${BASE_PATH_CLOUD}role`,

  NOTFOUND: `${BASE_PATH_CLOUD}*`,
  MAINTAIN: `${BASE_PATH_CLOUD}maintain`,
}
