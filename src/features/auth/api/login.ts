import { axios } from '~/lib/axios'

import { type UserResponse } from '../types'

export type LoginCredentialsDTO = {
  identifier: string
  password: string
}

export const loginWithEmailAndPassword = (
  data: LoginCredentialsDTO,
): Promise<UserResponse> => {
  return axios.post('/api/login', data)
}
