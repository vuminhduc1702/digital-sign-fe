export const BASE_PATH = '/'
export const BASE_PATH_CLOUD = '/cloud/'

export const PATHS: { [key: string]: string } = {
  HOME: `${BASE_PATH}`,
  ORG_MANAGEMENT: `${BASE_PATH_CLOUD}org-management`,
  ORG_MANAGE: `${BASE_PATH_CLOUD}org-management/org`,
  ORG_MANAGE_CHILD: `${BASE_PATH_CLOUD}org-management/org/:projectId`,
  GROUP_MANAGE: `${BASE_PATH_CLOUD}org-management/group`,
  GROUP_MANAGE_CHILD: `${BASE_PATH_CLOUD}org-management/group/:projectId`,
  USER_MANAGE: `${BASE_PATH_CLOUD}org-management/user`,
  USER_MANAGE_CHILD: `${BASE_PATH_CLOUD}org-management/user/:projectId`,
  DEVICE_MANAGE: `${BASE_PATH_CLOUD}org-management/device`,
  DEVICE_MANAGE_CHILD: `${BASE_PATH_CLOUD}org-management/device/:projectId`,
  EVENT_MANAGE: `${BASE_PATH_CLOUD}org-management/event`,
  EVENT_MANAGE_CHILD: `${BASE_PATH_CLOUD}org-management/event/:projectId`,
  ROLE_MANAGE: `${BASE_PATH_CLOUD}org-management/role`,
  ROLE_MANAGE_CHILD: `${BASE_PATH_CLOUD}org-management/role/:projectId`,

  DEVICE_TEMPLATE: `${BASE_PATH_CLOUD}device-template`,
  DEVICE_TEMPLATE_CHILD: `${BASE_PATH_CLOUD}device-template/:projectId/*`,
  FLOW_ENGINE: `${BASE_PATH_CLOUD}flow-engine`,
  FLOW_ENGINE_CHILD: `${BASE_PATH_CLOUD}flow-engine/:projectId/*`,
  DASHBOARD: `${BASE_PATH_CLOUD}dashboard`,
  DASHBOARD_CHILD: `${BASE_PATH_CLOUD}dashboard/:projectId/*`,

  NOTFOUND: `${BASE_PATH_CLOUD}*`,
  MAINTAIN: `${BASE_PATH_CLOUD}maintain`,
}
