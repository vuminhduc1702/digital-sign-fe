import Axios, {
  type AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'

import { API_URL } from '~/config'
import { PATHS } from '~/routes/PATHS'
import { useNotificationStore } from '~/stores/notifications'
import storage from '~/utils/storage'

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

axios.interceptors.request.use(authRequestInterceptor)
axios.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('error', error)
    let message = ''
    const errMessage = error.response?.data?.message

    switch (error.response?.status) {
      case 400:
        message = errMessage || 'Dữ liệu truyền lên không hợp lệ'
        break
      case 401:
        storage.clearProject()
        storage.clearToken()
        return (window.location.href = PATHS.LOGIN)
      case 403:
        message = errMessage || 'Bạn không có quyền truy cập vào trang này'
        break
      case 500:
        message = errMessage || 'Server đang bị lỗi, vui lòng thử lại'
        break
      default:
        message = errMessage || error.message
    }

    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Lỗi',
      message,
    })

    return Promise.reject(error)
  },
)
