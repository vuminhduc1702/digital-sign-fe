import { configureAuth } from 'react-query-auth'
import { getUser, type UserResponse } from '~/features/auth'

import storage from '~/utils/storage'

async function handleUserResponse(data: UserResponse) {
  const { jwt, user } = data
  storage.setToken(jwt)
  return user
}

async function userFn() {
  // if (storage.getToken()) {
  const data = await getUser()
  return data
  // return {
  //   email: 'vtag@viettel.com.vn',
  //   is_admin: true,
  // }
  // }
  // return {
  //   activate: true,
  //   admin_id: 'a48ddd36-5ab6-4794-928c-07248c73c0c1',
  //   attributes: null,
  //   business_license: '',
  //   cmp_role: '',
  //   created_time: 0,
  //   device_quantity: 61,
  //   email: 'anhdd11@viettel.com.vn',
  //   group_id: '',
  //   group_name: '',
  //   is_admin: false,
  //   msg_quantity: 1267910,
  //   name: '',
  //   org_id: '',
  //   org_name: '',
  //   p_plan_id: '',
  //   p_plan_name: '',
  //   phone: '',
  //   profile: {
  //     district: '',
  //     dob: null,
  //     full_address: '',
  //     gender: '',
  //     identity_info: { identity: '', front_image: '', back_image: '' },
  //     nationality: '',
  //     profile_image: '',
  //     province: '',
  //     ward: '',
  //   },
  //   role_id: '84ad6010-cf97-4a85-87f9-0cafa1d845b8',
  //   role_name: 'DefaultAdminRole',
  //   user_id: 'a48ddd36-5ab6-4794-928c-07248c73c0c1',
  //   username: '',
  //   valid_to: 0,
  // }
}

// async function loginFn(data: LoginCredentialsDTO) {
//   const response = await loginWithEmailAndPassword(data)
//   const user = await handleUserResponse(response)
//   return user
// }

// async function registerFn(data: RegisterCredentialsDTO) {
//   const response = await registerWithEmailAndPassword(data)
//   const user = await handleUserResponse(response)
//   return user
// }

// async function logoutFn() {
//   storage.clearToken()
//   window.location.assign(window.location.origin as unknown as string)
// }

const authConfig = {
  userFn,
  // loginFn,
  // registerFn,
  // logoutFn,
}

export const { useUser, AuthLoader } = configureAuth(authConfig)
