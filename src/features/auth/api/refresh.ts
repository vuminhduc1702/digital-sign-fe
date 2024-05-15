import Axios from 'axios'

import { API_URL } from '@/config'

import { type UserResponse } from '../types'

export const useRefreshToken = (
  refreshToken: string,
): Promise<{ data: UserResponse }> => {
  const axiosPersistLogin = Axios.create({
    baseURL: API_URL,
    headers: {
      RefreshToken: refreshToken,
    },
  })

  return axiosPersistLogin.get('/api/token/refresh')
}

// import { axios } from '@/lib/axios'

// import { type UserResponse } from '../types'

// export const useRefreshToken = (
//   refreshToken: string,
// ): Promise<UserResponse> => {
//   return axios.get('/api/token/refresh', {
//     headers: { RefreshToken: refreshToken },
//   })
// }
