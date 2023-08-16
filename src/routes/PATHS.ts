export const BASE_PATH = '/'
export const BASE_PATH_CLOUD = '/cloud/'

export const PATHS: { [key: string]: string } = {
  // Protected routes

  // Cloud routes
  PROJECT_MANAGE: `${BASE_PATH_CLOUD}project-management`,

  ORG_MANAGE: `${BASE_PATH_CLOUD}org-management/org`,
  THING_TEMPLATE: `${BASE_PATH_CLOUD}flow-engine-v2/thing`,
  THING_SERVICE: `${BASE_PATH_CLOUD}flow-engine-v2/thing-service`,
  TEMPLATE_FLOW: `${BASE_PATH_CLOUD}flow-engine-v2/template`,
  SHAPE_FLOW: `${BASE_PATH_CLOUD}flow-engine-v2/shape`,
  GROUP_MANAGE: `${BASE_PATH_CLOUD}org-management/group`,
  USER_MANAGE: `${BASE_PATH_CLOUD}org-management/user`,
  DEVICE_MANAGE: `${BASE_PATH_CLOUD}org-management/device`,
  EVENT_MANAGE: `${BASE_PATH_CLOUD}org-management/event`,

  DEVICE_TEMPLATE: `${BASE_PATH_CLOUD}device-template`,
  FLOW_ENGINE: `${BASE_PATH_CLOUD}flow-engine`,
  ROLE_MANAGE: `${BASE_PATH_CLOUD}role`,
  CUSTOM_PROTOCOL: `${BASE_PATH_CLOUD}custom-protocol`,

  DASHBOARD: `${BASE_PATH_CLOUD}dashboard`,

  // Public routes
  LOGIN: `${BASE_PATH}auth/login`,
  REGISTER: `${BASE_PATH}auth/register`,

  // Common routes
  HOME: `${BASE_PATH}`,
  MAINTAIN: `${BASE_PATH}maintain`,
  NOTFOUND: `${BASE_PATH}*`,
}
