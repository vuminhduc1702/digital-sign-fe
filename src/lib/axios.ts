import Axios, {
  type AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'

import { API_URL } from '~/config'
import { useNotificationStore } from '~/stores/notifications'
import storage from '~/utils/storage'

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const token = storage.getToken()
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
    console.log('error', error)
    let message = ''
    if (error.response?.status === 403) {
      message = 'Bạn không có quyền truy cập vào trang này'
    }
    // else if (error.response?.status === 401) {
    //   window.location.href = '/login'
    // }
    else {
      message = error.response?.data?.message || error.message
    }
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Lỗi',
      message,
    })

    return Promise.reject(error)
  },
)
