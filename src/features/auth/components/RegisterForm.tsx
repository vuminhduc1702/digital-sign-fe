import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'

import { Link } from '~/components/Link'
import { useRegister } from '~/lib/auth'
import { Form, InputField } from '~/components/Form'
import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'
import { sentOTP } from '../api/otp'
import i18n from '~/i18n'

import {
  emailSchema,
  otpSchema,
  passwordSchema,
} from '~/utils/schemaValidation'

import { BtnPasswordLoginIcon, BtnUserLoginIcon } from '~/components/SVGIcons'

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
        message: i18n.t('auth:pass_invalid'),
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
  const { t } = useTranslation()

  const registerMutation = useRegister()
  // const [email, setEmail] = useState('')
  const timeCountdown = 180
  const [countdown, setCountdown] = useState<number>(1)
  const [checkCountdown, setCheckCountdown] = useState<boolean>(false)
  const [btnOtpDisable, setBtnOtpDisable] = useState<boolean>(false)

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> = setInterval(() => {
      setCountdown(prevState => {
        if (prevState > 0) return prevState - 1
        else {
          clearInterval(timerId!)
          if (checkCountdown === true) {
            setCheckCountdown(false)
          }
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
          await registerMutation.mutateAsync(values)
          onSuccess()
        }}
        schema={registerSchema}
        options={{
          shouldUnregister: true,
        }}
      >
        {({ register, formState, getValues }) => {
          console.log('formState', formState.errors)
          return (
            <>
              <InputField
                type="email"
                className="mt-5 bg-stone-300"
                classnamefieldwrapper="relative"
                placeholder={t('auth:require_email')}
                error={formState.errors['email']}
                registration={register('email')}
                onChange={e => {
                  if (getValues('email') === '') {
                    setBtnOtpDisable(false)
                  } else {
                    setBtnOtpDisable(true)
                  }
                }}
                startIcon={
                  <BtnUserLoginIcon
                    height={20}
                    width={20}
                    viewBox="0 0 20 20"
                    className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                  />
                }
              />
              <InputField
                type="password"
                className="bg-stone-300"
                classnamefieldwrapper="relative"
                placeholder={t('auth:require_password')}
                error={formState.errors['password']}
                registration={register('password')}
                startIcon={
                  <BtnPasswordLoginIcon
                    height={20}
                    width={20}
                    viewBox="0 0 20 20"
                    className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                  />
                }
              />
              <InputField
                type="password"
                className="bg-stone-300"
                classnamefieldwrapper="relative"
                error={formState.errors['confirmPassword']}
                registration={register('confirmPassword')}
                placeholder={t('auth:confirm_password')}
                startIcon={
                  <BtnPasswordLoginIcon
                    height={20}
                    width={20}
                    viewBox="0 0 20 20"
                    className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                  />
                }
              />
              <Button
                variant="none"
                className="!mt-2 ml-auto h-[1rem] p-0 text-slate-800 underline"
                disabled={btnOtpDisable}
                onClick={() => {
                  if (getValues('email') !== '') {
                    setBtnOtpDisable(true)
                    sentOTP({
                      email: getValues('email'),
                      phone: '0337463520',
                    })
                      .then(() => {
                        setCountdown(timeCountdown)
                        setCheckCountdown(true)
                      })
                      .catch(error => {
                        setBtnOtpDisable(false)
                        console.log(error)
                      })
                  }
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
              <InputField
                type="text"
                error={formState.errors['otp']}
                registration={register('otp')}
                className="bg-stone-300"
                placeholder={t('auth:require_otp')}
              />
              <div className="container mx-auto text-center text-body-xs">
                <Button
                  isLoading={registerMutation.isLoading}
                  type="submit"
                  className="w-full bg-primary-400"
                >
                  {t('user:register')}
                </Button>
              </div>
            </>
          )
        }}
      </Form>
      <div className="mt-8 flex justify-center">
        <div className="text-body-sm text-black">
          {t('auth:have_an_account')}{' '}
          <Link to={PATHS.LOGIN} className="font-bold">
            {t('user:login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
