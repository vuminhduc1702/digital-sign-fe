import { axios } from '~/lib/axios'

type verifyCode = {
  phone: string
  email: string
}

export const sentOTP = ({ email, phone }: verifyCode): Promise<void> => {
  return axios.get(`/api/verifycode`, {
    params: {
      email: email,
    },
  })
}
