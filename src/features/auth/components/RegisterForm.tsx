import { Link } from '~/components/Link'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { useRegister } from '~/lib/auth'
import { Form, InputField } from '~/components/Form'
import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'
import {
  emailSchema,
  nameSchema,
  otpSchema,
  passwordSchema,
} from '~/utils/schemaValidation'
import { BtnPasswordLoginIcon, BtnUserLoginIcon } from '~/components/SVGIcons'
import { sentOTP } from '../api/otp'
import { useEffect, useState } from 'react'

const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema.optional(),
    otp: otpSchema,
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: 'Mật khẩu nhập lại không đúng',
      })
    }
  })

type RegisterValues = {
  email: string
  password: string
  confirmPassword: string
  otp: string
}

type RegisterFormProps = {
  onSuccess: () => void
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  let startCountdown = 180

  const { t } = useTranslation()

  const registerMutation = useRegister()
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState<number>(startCountdown)
  const [checkCountdown, setCheckCountdown] = useState<boolean>(false)
  const [btnOtpDisable, setBtnOtpDisable] = useState<boolean>(false)

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null

    timerId = setInterval(() => {
      setCountdown(prevState => {
        if (prevState > 0) return prevState - 1
        else {
          clearInterval(timerId!)
          setCheckCountdown(false)
          setBtnOtpDisable(false)
          return 0
        }
      })
    }, 1000)

    return () => {
      if (timerId) {
        clearInterval(timerId)
      }
    }
  }, [checkCountdown])

  return (
    <div>
      <Form<RegisterValues, typeof registerSchema>
        onSubmit={async values => {
          await registerMutation.mutate(values)
          onSuccess()
        }}
        schema={registerSchema}
        options={{
          shouldUnregister: true,
        }}
      >
        {({ register, formState }) => {
          console.log('formState', formState.errors)
          return (
            <>
              <InputField
                type="email"
                className="mt-5 bg-stone-300"
                // classNameError="absolute top-100%"
                placeholder={t('auth:require_email')}
                error={formState.errors['email']}
                registration={register('email')}
                onChange={e => {
                  setEmail(e.target.value)
                  console.log(e.target.value)
                }}
                startIcon={
                  <BtnUserLoginIcon
                    height={20}
                    width={20}
                    viewBox="0 0 20 20"
                    className="absolute left--5 top--5  z-20 m-2 h-5 w-5 border-e-red-600 hover:text-primary-400"
                  />
                }
              />
              <InputField
                type="password"
                className="bg-stone-300"
                // classNameError="absolute top-100%"
                placeholder={t('auth:require_password')}
                error={formState.errors['password']}
                registration={register('password')}
                startIcon={
                  <BtnPasswordLoginIcon
                    height={20}
                    width={20}
                    viewBox="0 0 20 20"
                    className="absolute left--5 top--5 z-20  m-2 h-5 w-5  hover:text-primary-400"
                  />
                }
              />
              <InputField
                type="password"
                className="bg-stone-300"
                // classNameError="absolute top-100%"
                error={formState.errors['confirmPassword']}
                registration={register('confirmPassword')}
                placeholder={t('auth:confirm_password')}
                startIcon={
                  <BtnPasswordLoginIcon
                    height={20}
                    width={20}
                    viewBox="0 0 20 20"
                    className="absolute left--5 top--5 z-20  m-2 h-5 w-5 hover:text-primary-400"
                  />
                }
              />
              <InputField
                type="text"
                // classNameError="absolute top-100%"
                error={formState.errors['otp']}
                registration={register('otp')}
                className="bg-stone-300"
                placeholder={t('auth:require_otp')}
                endIcon={
                  <Button
                    variant="none"
                    className="absolute bottom-[105%] right-[-20px] h-[1rem] border-none bg-transparent text-slate-800 underline"
                    disabled={btnOtpDisable}
                    onClick={() => {
                      setBtnOtpDisable(true)
                      sentOTP({
                        email: email,
                        phone: '0337463520',
                      })
                        .then(response => {
                          setCountdown(startCountdown)
                          setCheckCountdown(true)
                          console.log(response)
                        })
                        .catch(error => {
                          setBtnOtpDisable(false)
                          console.log(error)
                        })
                    }}
                  >
                    {checkCountdown === true && (
                      <>
                        {countdown}
                        {'s '}
                      </>
                    )}
                    {t('auth:sent_otp')}
                  </Button>
                }
              />
              <div className="container mx-auto text-center text-xs">
                <Button
                  isLoading={registerMutation.isLoading}
                  type="submit"
                  className="w-full bg-stone-500"
                >
                  {t('user:register')}
                </Button>
              </div>
            </>
          )
        }}
      </Form>
      <div className="mt-8 flex justify-center">
        <div className="text-body-sm  text-black">
          {t('auth:have_an_account')}{' '}
          <Link to={PATHS.LOGIN} className="font-bold hover:text-blue-500">
            {t('user:login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
