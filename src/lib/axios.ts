import Axios, {
  type AxiosError,
  type AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'

import { API_URL } from '@/config'
import storage from '@/utils/storage'
import { logoutFn } from './auth'
import { PATHS } from '@/routes/PATHS'
import i18n from '@/i18n'
import { toast } from 'sonner'

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const controller = new AbortController()

  // setTimeout(() => {
  //   controller.abort()
  // toast.error(i18n.t('error:server_res.title'), {
  //   description: 'aborttttttttttttttt'
  // })
  // }, 200)

  const userStorage = storage.getToken()
  const token = userStorage?.token
  if (token) {
    ;(config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`)
  }

  return {
    ...config,
    signal: controller.signal,
  }
}

export const axios = Axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 100,
  // timeoutErrorMessage: 'hahahahahahahahhaha',
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
  (error: AxiosError<{ code?: number; message?: string }>) => {
    console.error('res error: ', error)

    let message = ''
    const errRes = error.response

    if (errRes?.status === 401) {
      message = i18n.t('error:server_res.authorization')
      return logoutFn()
    }

    if (errRes?.data?.message === 'malformed entity specification') {
      message = i18n.t('error:server_res.malformed_data')
    }

    switch (errRes?.data?.code) {
      case 401:
        // if (window.location.pathname === PATHS.HOME) {
        //   break
        // }
        return logoutFn()
      case 403:
        message = i18n.t('error:server_res.authorization')
        break
      case 404:
        message = i18n.t('error:server_res.notfound')
        break
      case 2003:
        message = i18n.t('error:server_res_status.2003')
        break
      case 2004:
        message = i18n.t('error:server_res_status.2005')
        break
      case 2007:
        message = i18n.t('error:server_res_status.2007')
        break
      case 2008:
        message = i18n.t('error:server_res_status.2008')
        break
      case 2009:
        message = i18n.t('error:server_res_status.2009')
        break
      case 2010:
        message = i18n.t('error:server_res_status.2010')
        break
      case 8002:
        message = i18n.t('error:server_res_status.8002')
        break
      case 8001:
        message = i18n.t('error:server_res_status.8001')
        break
      case 2033:
        message = i18n.t('error:server_res_status.2033')
        break
      case 8006:
        message = i18n.t('error:server_res_status.8006')
        break
      case 8007:
        message = i18n.t('error:server_res_status.8007')
        break
      case 8008:
        message = i18n.t('error:server_res_status.8008')
        break
      case 8009:
        message = i18n.t('error:server_res_status.8009')
        break
      case 8010:
        message = i18n.t('error:server_res_status.8010')
        break
      case 4012:
        message = i18n.t('error:server_res_status.4012')
        break
      case 4002:
        message = i18n.t('error:server_res_status.4002')
        break
      case 4003:
        message = i18n.t('error:server_res_status.4003')
        break
      case 2021:
        message = i18n.t('error:server_res_status.2021')
        break
      case 2022:
        message = i18n.t('error:server_res_status.2022')
        break
      case 4010:
        message = i18n.t('error:server_res_status.4010')
        break
      case 4013:
        message = i18n.t('error:server_res_status.4013')
        break
      case 4014:
        message = i18n.t('error:server_res_status.4014')
        break
      case 4016:
        message = i18n.t('error:server_res_status.4016')
        break
      case 4001:
        message = i18n.t('error:server_res_status.4001')
        break
      case 4333:
        message = i18n.t('error:server_res_status.4333')
        break
      case 5001:
        message = i18n.t('error:server_res_status.5001')
        break
      case 5003:
        message = i18n.t('error:server_res_status.5003')
        break
      case 6504:
        message = i18n.t('error:server_res_status.6504')
        break
      case 6505:
        message = i18n.t('error:server_res_status.6505')
        break
      case 6506:
        message = i18n.t('error:server_res_status.6506')
        break
      case 6507:
        message = i18n.t('error:server_res_status.6507')
        break
      case 6501:
        message = i18n.t('error:server_res_status.6501')
        break
      case 2098:
        message = i18n.t('error:server_res_status.2098')
        break
      case 2001:
        message = i18n.t('error:server_res_status.2001')
        break
      case 5004:
        message = i18n.t('error:server_res_status.5004')
        break
      // case 400:
      //   message = i18n.t('error:server_res.malformed_data')
      //   break
      // case 500:
      //   message = i18n.t('error:server_res.server')
      //   break
      default:
        message = errRes?.data?.message ?? error.message
    }

    const customError = { ...error, message }

    return Promise.reject(customError)
  },
)
