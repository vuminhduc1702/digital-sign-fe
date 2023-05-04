const storagePrefix = 'iot_platform_'

const storage = {
  getToken: () => {
    // return JSON.parse(window.localStorage.getItem(`${storagePrefix}token`) as string);
    return '3x2UQjEr19YLiZrPnv5x4FE5Or81vkRY'
  },
  setToken: (token: string) => {
    window.localStorage.setItem(`${storagePrefix}token`, JSON.stringify(token))
  },
  clearToken: () => {
    window.localStorage.removeItem(`${storagePrefix}token`)
  },
}

export default storage
