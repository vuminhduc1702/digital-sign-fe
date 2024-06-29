export const BASE_PATH = '/'
const BASE_PATH_AUTH = '/auth/'

export const PATHS = {
  /**
   * Protected routes
   */
  SIGN: `${BASE_PATH}sign`,
  REQUEST: `${BASE_PATH}request`,
  CERTIFICATE: `${BASE_PATH}certificate`,
  VERIFY: `${BASE_PATH}verify`,
  HISTORY: `${BASE_PATH}history`,
  SIGN_REQUEST: `${BASE_PATH}sign-request`,

  // Public routes
  LOGIN: `${BASE_PATH_AUTH}login`,
  REGISTER: `${BASE_PATH_AUTH}register`,
  FORGETPASSWORD: `${BASE_PATH_AUTH}forgetpassword`,
  // Auth routes not public
  CHANGEPASSWORD: `${BASE_PATH_AUTH}changepassword`,

  /**
   * Common routes
   */

  // HOME: `${BASE_PATH}`,
  USER_INFO: `${BASE_PATH}user-info`,
  PDF_VIEWER: `${BASE_PATH}pdf-viewer`,
  VERSION: `${BASE_PATH}version`,
  MAINTAIN: `${BASE_PATH}maintain`,
  NOTFOUND: `${BASE_PATH}*`,
} as const satisfies { [key: string]: string }
