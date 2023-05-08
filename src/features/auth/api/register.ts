import { axios } from '~/lib/axios'

import { type UserResponse } from '../types'

export type RegisterCredentialsDTO = {
  email: string
  password: string
  otp: string
}

export const registerWithEmailAndPassword = (
  data: RegisterCredentialsDTO,
): Promise<UserResponse> => {
  return axios.post('/api/adminregister', data)
}
