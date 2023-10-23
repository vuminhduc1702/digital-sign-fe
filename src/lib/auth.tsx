import { configureAuth } from 'react-query-auth'

import { type UserResponse } from '~/features/auth'
import {
  type LoginCredentialsDTO,
  loginWithEmailAndPassword,
} from '~/features/auth/api/login'
import {
  type RegisterCredentialsDTO,
  registerWithEmailAndPassword,
} from '~/features/auth/api/register'

import { PATHS } from '~/routes/PATHS'

import storage from '~/utils/storage'

async function handleUserResponse(data: UserResponse) {
  const user = data
  storage.setToken({
    token: user.token,
    system_role: user.system_role,
    timestamp: new Date(),
    device_token: user.device_token,
  })
  return user
}

async function userFn() {
  return (storage.getToken() as UserResponse) || null
}

async function loginFn(data: LoginCredentialsDTO) {
  const response = await loginWithEmailAndPassword(data)
  const user = await handleUserResponse(response)
  return user
}

async function registerFn(data: RegisterCredentialsDTO) {
  const response = await registerWithEmailAndPassword(data)
  const user = await handleUserResponse(response)
  return user
}

export async function logoutFn() {
  storage.clearProject()
  storage.clearToken()
  window.location.assign(PATHS.LOGIN)
}

const authConfig = {
  userFn,
  loginFn,
  registerFn,
  logoutFn,
}

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig)
