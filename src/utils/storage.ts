import { type LoginCredentialsDTO } from '@/features/auth'
import { type RoleTypes } from '@/lib/authorization'

const storagePrefix = 'digital_sign_'

export type UserStorage = {
  token: string
  // refresh_token: string
  // system_role: RoleTypes
  // timestamp: Date
  // device_token: string
  // user_id: string
}

const storage = {
  getToken: (): UserStorage => {
    return JSON.parse(
      window.sessionStorage.getItem(`${storagePrefix}token`) as string,
    )
  },
  setToken: (token: UserStorage) => {
    window.sessionStorage.setItem(
      `${storagePrefix}token`,
      JSON.stringify(token),
    )
  },
  clearToken: () => {
    window.sessionStorage.removeItem(`${storagePrefix}token`)
  },

  getUserLogin: (): LoginCredentialsDTO => {
    return JSON.parse(
      window.sessionStorage.getItem(`${storagePrefix}user_login`) as string,
    )
  },
  setUserLogin: (token: LoginCredentialsDTO) => {
    window.sessionStorage.setItem(
      `${storagePrefix}user_login`,
      JSON.stringify(token),
    )
  },
  clearUserLogin: () => {
    window.sessionStorage.removeItem(`${storagePrefix}user_login`)
  },

  getIsPersistLogin: () => {
    return window.sessionStorage.getItem(`${storagePrefix}is-persist-login`)
  },
  setIsPersistLogin: (checked: boolean) => {
    window.sessionStorage.setItem(
      `${storagePrefix}is-persist-login`,
      JSON.stringify(checked),
    )
  },
  clearIsPersistLogin: () => {
    window.sessionStorage.removeItem(`${storagePrefix}is-persist-login`)
  },
}

export default storage
