import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'

import { Link } from '@/components/Link'
import { useRegister } from '@/lib/auth'
import { Button } from '@/components/ui/button'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

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
  const form = useForm<RegisterValues>({
    resolver: registerSchema && zodResolver(registerSchema),
    shouldUnregister: true,
  })
  const { register, handleSubmit, getValues } = form
  return (
    <div>
      <Form {...form}>
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      className="mt-5 bg-stone-300"
                      startIcon={
                        <BtnUserLoginIcon
                          height={20}
                          width={20}
                          viewBox="0 0 20 20"
                          className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                        />
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="mt-5 bg-stone-300"
                      placeholder={t('auth:require_email')}
                      startIcon={
                        <BtnUserLoginIcon
                          height={20}
                          width={20}
                          viewBox="0 0 20 20"
                          className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                        />
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth:require_password')}
                      className="bg-stone-300"
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
                            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
                            onClick={togglePasswordVisibility}
                          />
                        ) : (
                          <EyeHide
                            height={24}
                            width={24}
                            viewBox="0 0 24 24"
                            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
                            onClick={togglePasswordVisibility}
                          />
                        )
                      }
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type={showRePassword ? 'text' : 'password'}
                      placeholder={t('auth:confirm_password')}
                      className="bg-stone-300"
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
                            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
                            onClick={toggleRePasswordVisibility}
                          />
                        ) : (
                          <EyeHide
                            height={24}
                            width={24}
                            viewBox="0 0 24 24"
                            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
                            onClick={toggleRePasswordVisibility}
                          />
                        )
                      }
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
      </Form>
      <div className="mt-8 flex justify-center py-10">
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
