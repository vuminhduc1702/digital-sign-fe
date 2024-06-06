import { axios } from '@/lib/axios'

import { type UserResponse } from '../types'
import { type LoginCredentialsDTO } from '../components/LoginForm'

export const loginWithEmailAndPassword = (
  data: LoginCredentialsDTO,
): Promise<UserResponse> => {
  return axios.post('/api/user/authenticate', data)
}
