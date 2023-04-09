import { axios } from '~/lib/axios'

import { type User } from '../types'

export const getUser = (): Promise<User> => {
  return axios.get('/api/users/self')
}
