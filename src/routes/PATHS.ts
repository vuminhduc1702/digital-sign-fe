export const BASE_PATH = '/'
export const BASE_PATH_CLOUD = '/cloud/'

export const PATHS: { [key: string]: string } = {
  HOME: `${BASE_PATH}`,
  ORG_INFO: `${BASE_PATH_CLOUD}org-management/org-info/:projectId`,
  GROUP_MANAGE: `${BASE_PATH_CLOUD}org-management/group-manage/:projectId`,
  USER_MANAGE: `${BASE_PATH_CLOUD}org-management/user-manage/:projectId`,
  DEVICE_MANAGE: `${BASE_PATH_CLOUD}org-management/device-manage/:projectId`,
  EVENT_MANAGE: `${BASE_PATH_CLOUD}org-management/event-manage/:projectId`,
  ROLE_MANAGE: `${BASE_PATH_CLOUD}org-management/role-manage/:projectId`,

  DEVICE_TEMPLATE: `${BASE_PATH_CLOUD}device-template/:projectId`,
  FLOW_ENGINE: `${BASE_PATH_CLOUD}flow-engine/:projectId`,
  DASHBOARD: `${BASE_PATH_CLOUD}dashboard/:projectId`,

  NOTFOUND: `${BASE_PATH_CLOUD}*`,
  MAINTAIN: `${BASE_PATH_CLOUD}maintain`,
}
