const storagePrefix = 'iot_platform_'

const storage = {
  getToken: () => {
    // return JSON.parse(window.localStorage.getItem(`${storagePrefix}token`) as string);
    return '8jWRDFevujtHjM0MUz6SqyzX9ydbCqsh'
  },
  setToken: (token: string) => {
    window.localStorage.setItem(`${storagePrefix}token`, JSON.stringify(token))
  },
  clearToken: () => {
    window.localStorage.removeItem(`${storagePrefix}token`)
  },
}

export default storage
