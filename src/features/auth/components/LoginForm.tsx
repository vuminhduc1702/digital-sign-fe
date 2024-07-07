import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FieldWrapper } from '@/components/Form'
import { Link } from '@/components/Link'
import { useLogin } from '@/lib/auth'
import { PATHS } from '@/routes/PATHS'
import { emailSchema, passwordSchema } from '@/utils/schemaValidation'
import { Checkbox } from '@/components/ui/checkbox'
import storage from '@/utils/storage'

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

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginCredentialsDTO = z.infer<typeof loginSchema>

type LoginFormProps = {
  onSuccess: () => void
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { t } = useTranslation()
  const userStorage = storage.getUserLogin()

  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }
  const form = useForm<LoginCredentialsDTO>({
    resolver: loginSchema && zodResolver(loginSchema),
    values: {
      password: userStorage?.password,
      email: userStorage?.email,
    },
  })
  const { handleSubmit, control } = form
  return (
    <div>
      <Form {...form}>
        <form
          className="w-full space-y-6"
          onSubmit={handleSubmit(async values => {
            await login.mutateAsync(values)
            onSuccess()
          })}
        >
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="mt-10 bg-stone-300"
                      autoComplete="off"
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
                      className="bg-stone-300"
                      autoComplete="nope"
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button
                isLoading={login.isLoading}
                type="submit"
                className="w-full bg-primary-400"
                variant="primary"
              >
                Đăng nhập
              </Button>
            </div>
          </>
        </form>
      </Form>

      <div className="py-10">
        <div className="container mx-auto text-center">
          <ul className="text-body-xs">
            <li className="m-1">
              Chưa có tài khoản?
              <Link to={PATHS.REGISTER} className="font-bold text-black">
                Đăng ký
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
