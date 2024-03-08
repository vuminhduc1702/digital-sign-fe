export const BASE_PATH = '/'
export const BASE_PATH_AUTH = '/auth/'
export const BASE_PATH_CLOUD = '/cloud/'
export const BASE_PATH_PAYMENT = '/payment/'
export const BASE_PATH_INTEGRATION = '/integration/'
export const BASE_PATH_DEVICE = '/device/'
export const BASE_PATH_APPLICATION = '/application/'
export const BASE_PATH_TENANT = '/tenant'
export const BASE_PATH_DEV_ROLE = '/dev-role'

export const PATHS = {
  /**
   * Protected routes
   */

  // Project routes
  PROJECT_MANAGE: `${BASE_PATH}project-management`,
  OVER_VIEW: `${BASE_PATH}overview`,

  // Cloud routes
  ORG: `${BASE_PATH_CLOUD}org-management`,
  ORG_MANAGE: `${BASE_PATH_CLOUD}org-management/org`,
  GROUP_MANAGE: `${BASE_PATH_CLOUD}org-management/group`,
  USER_MANAGE: `${BASE_PATH_CLOUD}org-management/user`,
  DEVICE_MANAGE: `${BASE_PATH_CLOUD}org-management/device`,
  EVENT_MANAGE: `${BASE_PATH_CLOUD}org-management/event`,

  FLOW_ENGINE_V2: `${BASE_PATH_CLOUD}flow-engine-v2`,
  THING_TEMPLATE: `${BASE_PATH_CLOUD}flow-engine-v2/thing`,
  TEMPLATE_FLOW: `${BASE_PATH_CLOUD}flow-engine-v2/template`,
  SHAPE_FLOW: `${BASE_PATH_CLOUD}flow-engine-v2/shape`,

  FIRM_WARE: `${BASE_PATH_CLOUD}firmware`,

  DEVICE_TEMPLATE: `${BASE_PATH_CLOUD}device-template`,
  TEMPLATE_DEFAULT: `${BASE_PATH_CLOUD}device-template/default`,
  TEMPLATE_LWM2M: `${BASE_PATH_CLOUD}device-template/lwm2m`,
  FLOW_ENGINE: `${BASE_PATH_CLOUD}flow-engine`,
  DASHBOARD: `${BASE_PATH_CLOUD}dashboard`,
  ROLE_MANAGE: `${BASE_PATH_CLOUD}role`,
  CUSTOM_PROTOCOL: `${BASE_PATH_CLOUD}custom-protocol`,
  DB_TEMPLATE: `${BASE_PATH_CLOUD}database-template`,

  // Billing route
  BILLING: `${BASE_PATH_PAYMENT}billing`,
  BILLING_PACKAGE: `${BASE_PATH_PAYMENT}billing-package`,
  BILLING_SUBSCRIPTION: `${BASE_PATH_PAYMENT}billing-subscription`,
  CUSTOMER_MANAGE: `${BASE_PATH_PAYMENT}customer-manage`,

  // Tenant route
  TENANT_MANAGE: `${BASE_PATH_TENANT}`,
  DEV_ROLE: `${BASE_PATH_DEV_ROLE}`,

  // Integration route
  AI: `${BASE_PATH_INTEGRATION}ai`,
  DDOS: `${BASE_PATH_INTEGRATION}ai/ddos`,
  FUEL: `${BASE_PATH_INTEGRATION}ai/fuel`,

  // Device routes
  DEVKIT: `${BASE_PATH_DEVICE}devkit`,
  MODULE: `${BASE_PATH_DEVICE}module`,

  //Application routes
  APPSDK: `${BASE_PATH_APPLICATION}appSdk`,
  APPDEBUG: `${BASE_PATH_APPLICATION}appDebug`,

  // Public routes
  LOGIN: `${BASE_PATH_AUTH}login`,
  REGISTER: `${BASE_PATH_AUTH}register`,
  FORGETPASSWORD: `${BASE_PATH_AUTH}forgetpassword`,
  // Auth routes not public
  CHANGEPASSWORD: `${BASE_PATH_AUTH}changepassword`,

  /**
   * Common routes
   */

  HOME: `${BASE_PATH}`,
  USER_INFO: `${BASE_PATH}user-info`,
  PDF_VIEWER: `${BASE_PATH}pdf-viewer`,
  VERSION: `${BASE_PATH}version`,
  MAINTAIN: `${BASE_PATH}maintain`,
  NOTFOUND: `${BASE_PATH}*`,
} as const satisfies { [key: string]: string }
