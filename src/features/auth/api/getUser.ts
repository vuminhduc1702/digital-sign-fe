import { axios } from '~/lib/axios'

import { type UserInfo } from '../types'

export const getUser = (): Promise<UserInfo> => {
  return axios.get('/api/users/self')
}
