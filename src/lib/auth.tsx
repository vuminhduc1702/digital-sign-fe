import { configureAuth } from 'react-query-auth'

import { type UserResponse } from '@/features/auth'
import {
  type LoginCredentialsDTO,
  loginWithEmailAndPassword,
} from '@/features/auth/api/login'
import {
  type RegisterCredentialsDTO,
  registerWithEmailAndPassword,
} from '@/features/auth/api/register'

import { PATHS } from '@/routes/PATHS'

import storage from '@/utils/storage'

async function handleUserResponse(data: UserResponse) {
  const user = data
  storage.setToken({
    token: user.token,
    system_role: user.system_role,
    timestamp: new Date(),
    device_token: user.device_token,
    user_id: user.user_id,
  })
  return user
}

async function userFn() {
  return (storage.getToken() as UserResponse) || null
}

async function loginFn(data: LoginCredentialsDTO) {
  const response = await loginWithEmailAndPassword(data)
  const user = await handleUserResponse(response)
  if (data?.checked) {
    storage.setUserLogin(data)
  } else {
    storage.clearUserLogin()
  }
  return user
}

async function registerFn(data: RegisterCredentialsDTO) {
  const response = await registerWithEmailAndPassword(data)
  const user = await handleUserResponse(response)
  return user
}

export async function logoutFn() {
  const UserStorage = storage.getUserLogin() as LoginCredentialsDTO
  if (!UserStorage?.checked) storage.clearUserLogin()
  storage.clearProject()
  storage.clearToken()
  window.location.assign(PATHS.LOGIN)
  // window.history.replaceState({ from: window.location.pathname }, PATHS.LOGIN)
}

const authConfig = {
  userFn,
  loginFn,
  registerFn,
  logoutFn,
}

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig)
