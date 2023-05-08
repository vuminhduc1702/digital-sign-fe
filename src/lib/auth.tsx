import { configureAuth } from 'react-query-auth'

import { getUser, type UserResponse } from '~/features/auth'
import {
  type LoginCredentialsDTO,
  loginWithEmailAndPassword,
} from '~/features/auth/api/login'
import {
  type RegisterCredentialsDTO,
  registerWithEmailAndPassword,
} from '~/features/auth/api/register'

import storage from '~/utils/storage'

async function handleUserResponse(data: UserResponse) {
  const { token, user } = data
  storage.setToken(token)
  return user
}

async function userFn() {
  if (storage.getToken()) {
    const data = await getUser()
    return data
  }
  return null
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

async function logoutFn() {
  storage.clearToken()
  window.location.assign(window.location.origin as unknown as string)
}

const authConfig = {
  userFn,
  loginFn,
  registerFn,
  logoutFn,
}

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig)
