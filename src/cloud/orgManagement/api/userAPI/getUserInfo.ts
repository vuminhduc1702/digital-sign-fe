import { useQuery } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

export type Profile = {
  identity_info: {
    identity: string
    front_image: string
    back_image: string
    registration_form_image: string
    authorization_letter_image: string
  }
  dob: string | null
  nationality: string
  province: string
  district: string
  ward: string
  full_address: string
  url: string
  company: string
  gender: string
  profile_image: string
  tax_code: string
}

export type UserInfo = {
  name: string
  email: string
  admin_id: string
  user_id: string
  is_admin: boolean
  activate: boolean
  role_id: string
  role_name: string
  group_id: string
  group_name: string
  profile: Profile
  org_id: string
  org_name: string
  customer_code: string
  phone: string
}

export const getUserInfo = (): Promise<UserInfo> => {
  return axios.get('/api/users/self')
}

type QueryFnType = typeof getUserInfo

type UseUserInfoOptions = {
  config?: QueryConfig<QueryFnType>
}

export const useUserInfo = ({ config }: UseUserInfoOptions = {}) => {
  const userInfoQuery = useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['user-info'],
    queryFn: () => getUserInfo(),
    ...config,
  })

  return userInfoQuery
}
