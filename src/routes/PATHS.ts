export const BASE_PATH = '/'
export const BASE_PATH_CLOUD = '/cloud/'
export const BASE_PATH_PAYMENT = '/payment/'

export const PATHS: { [key: string]: string } = {
  // Protected routes

  // Cloud routes
  PROJECT_MANAGE: `${BASE_PATH_CLOUD}project-management`,

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

  DEVICE_TEMPLATE: `${BASE_PATH_CLOUD}device-template`,
  FLOW_ENGINE: `${BASE_PATH_CLOUD}flow-engine`,
  ROLE_MANAGE: `${BASE_PATH_CLOUD}role`,
  CUSTOM_PROTOCOL: `${BASE_PATH_CLOUD}custom-protocol`,
  BILLING: `${BASE_PATH_PAYMENT}billing`,
  BILLING_PACKAGE: `${BASE_PATH_PAYMENT}billing-package`,
  BILLING_SUBCRIPTION: `${BASE_PATH_PAYMENT}billing-subcription`,
  USER_ACCOUNT : `${BASE_PATH_CLOUD}user_account`,

  DASHBOARD: `${BASE_PATH_CLOUD}dashboard`,
  FIRM_WARE: `${BASE_PATH_CLOUD}firmware`,

  // Public routes
  LOGIN: `${BASE_PATH}auth/login`,
  REGISTER: `${BASE_PATH}auth/register`,
  FORGETPASSWORD: `${BASE_PATH}auth/forgetpassword`,
  // Auth routes not public
  CHANGEPASSWORD: `${BASE_PATH}auth/changepassword`,

  // Device routes
  DEVKIT: `${BASE_PATH}devkit`,
  MODULE: `${BASE_PATH}module`,

  //Application routes
  APPSDK: `${BASE_PATH}appSdk`,
  APPDEBUG: `${BASE_PATH}appDebug`,

  //Version routes
  VERSION:`${BASE_PATH}version`,
  
  // Common routes
  HOME: `${BASE_PATH}`,
  MAINTAIN: `${BASE_PATH}maintain`,
  NOTFOUND: `${BASE_PATH}*`,
}
