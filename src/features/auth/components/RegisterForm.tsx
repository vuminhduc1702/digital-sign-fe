import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'

import { Link } from '@/components/Link'
import { useRegister } from '@/lib/auth'
import { InputField } from '@/components/Form'
import { Button } from '@/components/Button'
import { PATHS } from '@/routes/PATHS'
import { sentOTP } from '../api/otp'
import i18n from '@/i18n'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  emailSchema,
  otpSchema,
  passwordSchema,
} from '@/utils/schemaValidation'

import {
  BtnPasswordLoginIcon,
  BtnUserLoginIcon,
  EyeHide,
  EyeShow,
} from '@/components/SVGIcons'

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

  const timeCountdown = 180
  const [countdown, setCountdown] = useState<number>(1)
  const [checkCountdown, setCheckCountdown] = useState<boolean>(false)
  const [btnOtpDisable, setBtnOtpDisable] = useState<boolean>(true)
  const intervalRef: React.MutableRefObject<number | null> = useRef<
    number | null
  >(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)
  const toggleRePasswordVisibility = () => {
    setShowRePassword(prev => !prev)
  }
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  function updateCountdown() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setCountdown(prevState => {
        if (prevState > 0) {
          return prevState - 1
        } else {
          setCheckCountdown(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          setBtnOtpDisable(false)
          return 0
        }
      })
    }, 1000)
  }
  const { register, formState, handleSubmit, getValues } =
    useForm<RegisterValues>({
      resolver: registerSchema && zodResolver(registerSchema),
      shouldUnregister: true,
    })
  return (
    <div>
      <form
        className="w-full space-y-6"
        onSubmit={handleSubmit(async values => {
          const data = {
            ...values,
            otp: values?.otp?.trim(),
          }
          await registerMutation.mutateAsync(data)
          onSuccess()
        })}
      >
        <>
          <InputField
            type="email"
            className="mt-5 bg-stone-300"
            classnamefieldwrapper="relative"
            placeholder={t('auth:require_email')}
            error={formState.errors['email']}
            registration={register('email', {
              onChange: e => {
                const emailValue = e.target.value
                if (emailSchema.safeParse(emailValue).success) {
                  setBtnOtpDisable(false)
                } else {
                  setBtnOtpDisable(true)
                }
              },
            })}
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
            type={showPassword ? 'text' : 'password'}
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
            endIcon={
              showPassword ? (
                <EyeShow
                  height={24}
                  width={24}
                  viewBox="0 0 24 24"
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2"
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <EyeHide
                  height={24}
                  width={24}
                  viewBox="0 0 24 24"
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2"
                  onClick={togglePasswordVisibility}
                />
              )
            }
            autoComplete="new-password"
          />
          <InputField
            type={showRePassword ? 'text' : 'password'}
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
            endIcon={
              showRePassword ? (
                <EyeShow
                  height={24}
                  width={24}
                  viewBox="0 0 24 24"
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2"
                  onClick={toggleRePasswordVisibility}
                />
              ) : (
                <EyeHide
                  height={24}
                  width={24}
                  viewBox="0 0 24 24"
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2"
                  onClick={toggleRePasswordVisibility}
                />
              )
            }
            autoComplete="new-password"
          />
          <Button
            variant="none"
            className="!mt-2 ml-auto h-4 p-0 text-slate-800 underline"
            disabled={btnOtpDisable}
            onClick={() => {
              setBtnOtpDisable(true)
              if (getValues('email') !== '') {
                sentOTP({
                  email: getValues('email'),
                })
                  .then(() => {
                    setCountdown(timeCountdown)
                    setCheckCountdown(true)
                    updateCountdown()
                  })
                  .catch(error => {
                    setBtnOtpDisable(false)
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
            autoComplete="one-time-code"
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
      </form>
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
