import { axios } from '~/lib/axios'

type verifyCode = {
  phone: string
  email: string
}

export const sentOTP  = async ({ email, phone }: verifyCode): Promise<void> => {
  return await axios.get(`/api/verifycode`, {
    params: {
      email: email,
    },
  })
}
