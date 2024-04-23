import { axios } from '@/lib/axios'

type verifyCode = {
  email: string
  forgot_password?: boolean
}

export const sentOTP = ({
  email,
  forgot_password,
}: verifyCode): Promise<void> => {
  return axios.get(`/api/verifycode`, {
    params: {
      email: email,
      forgot_password: forgot_password,
    },
  })
}
