import { configureAuth } from 'react-query-auth'

import { type UserResponse } from '@/features/auth'
import { loginWithEmailAndPassword } from '@/features/auth/api/login'
import {
  type RegisterCredentialsDTO,
  registerWithEmailAndPassword,
} from '@/features/auth/api/register'

import { PATHS } from '@/routes/PATHS'
import storage from '@/utils/storage'

import { type LoginCredentialsDTO } from '@/features/auth/components/LoginForm'

async function handleUserResponse(user: UserResponse) {
  storage.setToken({
    token: user.token,
    refresh_token: user.refresh_token,
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
  if (data?.checked) {
    storage.setUserLogin(data)
  } else {
    storage.clearUserLogin()
  }
  if (data?.isPersistLogin) {
    storage.setIsPersistLogin(true)
  } else {
    storage.clearIsPersistLogin()
  }

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
  const UserStorage = storage.getUserLogin() as LoginCredentialsDTO
  if (!UserStorage?.checked) storage.clearUserLogin()
  if (!UserStorage?.isPersistLogin) storage.clearIsPersistLogin()
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
