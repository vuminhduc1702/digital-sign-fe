import { type Project } from '~/cloud/project/routes/ProjectManage'
import { type RoleTypes } from '~/lib/authorization'

const storagePrefix = 'iot_platform_'

export type UserStorage = {
  token: string
  system_role: RoleTypes
  timestamp: Date
  device_token: string
}

const storage = {
  getToken: (): UserStorage => {
    return JSON.parse(
      window.localStorage.getItem(`${storagePrefix}token`) as string,
    )
  },
  setToken: (token: UserStorage) => {
    window.localStorage.setItem(`${storagePrefix}token`, JSON.stringify(token))
  },
  clearToken: () => {
    window.localStorage.removeItem(`${storagePrefix}token`)
  },

  getProject: (): Project => {
    return JSON.parse(
      window.localStorage.getItem(`${storagePrefix}project`) as string,
    )
  },
  setProject: (project: Project) => {
    window.localStorage.setItem(
      `${storagePrefix}project`,
      JSON.stringify(project),
    )
  },
  clearProject: () => {
    window.localStorage.removeItem(`${storagePrefix}project`)
  },
  getHistoryPath: () => {
    return window.localStorage.getItem(`previousPath`) as string
  },
  setHistoryPath: (path : string) => {
    localStorage.setItem('previousPath', path)
  },
  clearHistoryPath: () => {
    window.localStorage.removeItem(`previousPath`)
  },
}

export default storage
