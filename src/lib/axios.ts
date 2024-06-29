import Axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { API_URL } from '@/config'
import storage from '@/utils/storage'
import { logoutFn } from './auth'
import i18n from '@/i18n'
import { useRefreshToken } from '@/features/auth/api/refresh'

type AxiosRequestConfig = InternalAxiosRequestConfig & { sent?: boolean }

function authRequestInterceptor(config: AxiosRequestConfig) {
  const controller = new AbortController()

  const userStorage = storage.getToken()
  const token = userStorage?.token
  if (token && !config?.sent) {
    config.headers.set('Authorization', `Bearer ${token}`)
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
})

axios.interceptors.request.use(authRequestInterceptor)

let refreshInProgress = false
axios.interceptors.response.use(
  response => {
    let message = ''
    const errCode = response?.data?.code
    const errMessage = response?.data?.message

    // if (errMessage === 'malformed entity specification') {
    //   message = i18n.t('error:server_res.malformed_data')
    //   const customError = { ...response?.data, message }

    //   return Promise.reject(customError)
    // }
    if (errCode != null && errCode !== 0) {
      message = errMessage ?? i18n.t('error:server_res.server')
      const customError = { ...response?.data, message }

      return Promise.reject(customError)
    } else {
      return response.data
    }
  },
  async (error: AxiosError<{ code?: number; message?: string }>) => {
    console.error('res error: ', error)

    let message = ''
    const errRes = error.response

    // if (errRes?.data?.message === 'malformed entity specification') {
    //   message = i18n.t('error:server_res.malformed_data')
    // }

    switch (errRes?.status) {
      case 401:
        return logoutFn()
        // if (!refreshInProgress) {
        //   refreshInProgress = true
        //   const refreshToken = storage.getToken()?.refresh_token
        //   const prevRequest = error?.config as AxiosRequestConfig
        //   if (
        //     storage.getIsPersistLogin() === 'true' &&
        //     refreshToken != null &&
        //     !prevRequest?.sent
        //   ) {
        //     prevRequest.sent = true
        //     try {
        //       const {
        //         data: { token: newAccessToken },
        //       } = await useRefreshToken(refreshToken)
        //       if (newAccessToken != null) {
        //         storage.setToken({
        //           ...storage.getToken(),
        //           token: newAccessToken,
        //           refresh_token: refreshToken,
        //         })
        //       }
        //     } catch {
        //       return logoutFn()
        //     } finally {
        //       refreshInProgress = false
        //     }
        //   } else {
        //     return logoutFn()
        //   }
        // }
        break
      case 403:
        message = i18n.t('error:server_res.authorization')
        break
      case 404:
        message = i18n.t('error:server_res.notfound')
        break
      case 500:
        message = i18n.t('error:server_res.500')
        break
      default:
        message = errRes?.data?.message ?? error.message
    }

    const customError = { ...error, message }

    return Promise.reject(customError)
  },
)
