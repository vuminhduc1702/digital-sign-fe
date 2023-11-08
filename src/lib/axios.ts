import Axios, {
  type AxiosError,
  type AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'

import { API_URL } from '~/config'
import storage from '~/utils/storage'
import { logoutFn } from './auth'
import { PATHS } from '~/routes/PATHS'

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
      console.log('first')
      message = 'Dữ liệu truyền lên không hợp lệ'
      const customError = { ...response?.data, message }

      return Promise.reject(customError)
    }
    if (errCode != null && errCode !== 0) {
      message = 'Lỗi! Vui lòng thử lại'
      const customError = { ...response?.data, message }

      return Promise.reject(customError)
    } else {
      return response.data
    }
  },
  (error: AxiosError) => {
    console.error('res error: ', error)
    let message = ''
    switch (error.response?.status) {
      case 400:
        message = 'Lỗi 400: Dữ liệu truyền lên không hợp lệ'
        break
      case 401:
        if (window.location.pathname === PATHS.HOME) {
          break
        }
        return logoutFn()
      case 403:
        message = 'Lỗi 403: Bạn không có quyền truy cập vào trang này.'
        break
      case 404:
        message =
          'Lỗi 404: Web đang bị lỗi, bản vá sắp được hoàn thành, xin lỗi về sự bất tiện này.'
        break
      case 500:
        message = 'Lỗi 500: Server đang bị lỗi, vui lòng thử lại.'
        break
      default:
        message = error.message
    }
    const customError = { ...error, message }
    console.log('customError', customError)

    if (window.location.pathname === PATHS.HOME) {
      return
    }

    return Promise.reject(customError)
  },
)
