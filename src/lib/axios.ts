import Axios, {
  type AxiosError,
  type AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'

import { API_URL } from '~/config'
import storage from '~/utils/storage'
import { logoutFn } from './auth'
import { PATHS } from '~/routes/PATHS'
import i18n from '~/i18n'

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const userStorage = storage.getToken()
  const token = userStorage?.token
  if (token) {
    ;(config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`)
  }

  return config
}

export const axios = Axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const axiosUploadFile = Axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

axios.interceptors.request.use(authRequestInterceptor)
axiosUploadFile.interceptors.request.use(authRequestInterceptor)
axios.interceptors.response.use(
  response => {
    let message = ''
    const errCode = response?.data?.code
    const errMessage = response?.data?.message
    if (errMessage === 'malformed entity specification') {
      message = i18n.t('error:server_res.malformed_data')
      const customError = { ...response?.data, message }

      return Promise.reject(customError)
    }
    if (errCode != null && errCode !== 0) {
      message = errMessage ?? i18n.t('error:server_res.server')
      const customError = { ...response?.data, message }

      return Promise.reject(customError)
    } else {
      return response.data
    }
  },
  (error: AxiosError<{ error: string }>) => {
    console.error('res error: ', error)
    let message = ''
    switch (error.response?.status) {
      case 400:
        message = i18n.t('error:server_res.malformed_data')
        break
      case 401:
        if (window.location.pathname === PATHS.HOME) {
          break
        }
        return logoutFn()
      case 403:
        message = i18n.t('error:server_res.authorization')
        break
      case 404:
        message = i18n.t('error:server_res.notfound')
        break
      // case 500:
      //   message = i18n.t('error:server_res.server')
      //   break
      default:
        message = error?.response?.data?.error ?? error.message
    }

    if (error.response?.data?.error === 'malformed entity specification') {
      message = i18n.t('error:server_res.malformed_data')
    }

    const customError = { ...error, message }

    return Promise.reject(customError)
  },
)
