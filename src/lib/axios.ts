import Axios, {
  type AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'

import { API_URL } from '~/config'
import { useNotificationStore } from '~/stores/notifications'
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
    // console.log('response', response)
    let message = ''
    const errCode = response?.data?.code
    const errMessage = response?.data?.message
    if (errMessage === 'malformed entity specification') {
      message = 'Dữ liệu truyền lên không hợp lệ'
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Lỗi',
        message,
      })

      return Promise.reject(response.data)
    }
    if (errCode != null && errCode !== 0) {
      message = 'Lỗi! Vui lòng thử lại'
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Lỗi',
        message,
      })

      return Promise.reject(response.data)
    } else {
      return response.data
    }
  },
  error => {
    console.error('error', error)
    let message = ''
    const errMessage =
      error.response?.data?.message || error.response?.data?.error

    switch (error.response?.status) {
      case 400:
        message = errMessage || 'Dữ liệu truyền lên không hợp lệ'
        break
      case 401:
        if (window.location.pathname === PATHS.HOME) {
          break
        }
        return logoutFn()
      case 403:
        message = errMessage || 'Bạn không có quyền truy cập vào trang này'
        break
      case 500:
        message = errMessage || 'Server đang bị lỗi, vui lòng thử lại'
        break
      default:
        message = errMessage || error.message
    }

    if (window.location.pathname === PATHS.HOME) {
      return
    }

    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Lỗi',
      message,
    })

    return Promise.reject(error)
  },
)
