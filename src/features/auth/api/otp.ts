import { axios } from '~/lib/axios'

type verifyCode = {
  email: string
}

export const sentOTP = ({ email }: verifyCode): Promise<void> => {
  return axios.get(`/api/verifycode`, {
    params: {
      email: email,
    },
  })
}
