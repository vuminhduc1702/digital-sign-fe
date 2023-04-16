const storagePrefix = 'iot_platform_'

const storage = {
  getToken: () => {
    // return JSON.parse(window.localStorage.getItem(`${storagePrefix}token`) as string);
    return 'ceJfAjiEc2RcJvIFbZtVRmkxLs2uV7p9'
  },
  setToken: (token: string) => {
    window.localStorage.setItem(`${storagePrefix}token`, JSON.stringify(token))
  },
  clearToken: () => {
    window.localStorage.removeItem(`${storagePrefix}token`)
  },
}

export default storage
