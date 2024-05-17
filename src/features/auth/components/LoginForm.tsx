import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FieldWrapper, InputField } from '@/components/Form'
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

const loginSchema = z.object({
  identifier: emailSchema,
  password: passwordSchema,
  checked: z.boolean().optional(),
  isPersistLogin: z.boolean().optional(),
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
  const { register, formState, handleSubmit, control } =
    useForm<LoginCredentialsDTO>({
      resolver: loginSchema && zodResolver(loginSchema),
      values: {
        password: userStorage?.password,
        identifier: userStorage?.identifier,
        checked: userStorage?.checked,
        isPersistLogin: storage.getIsPersistLogin() === 'true' ? true : false,
      },
    })
  return (
    <div>
      <form
        className="w-full space-y-6"
        onSubmit={handleSubmit(async values => {
          await login.mutateAsync(values)
          onSuccess()
        })}
      >
        <>
          <InputField
            type="email"
            className="mt-10 bg-stone-300"
            classnamefieldwrapper="relative"
            placeholder={t('auth:require_email')}
            startIcon={
              <BtnUserLoginIcon
                height={20}
                width={20}
                viewBox="0 0 20 20"
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
              />
            }
            error={formState.errors['identifier']}
            registration={register('identifier')}
            autoComplete="off"
          />
          <InputField
            type={showPassword ? 'text' : 'password'}
            placeholder={t('user:password')}
            className="bg-stone-300"
            classnamefieldwrapper="relative"
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
            error={formState.errors['password']}
            registration={register('password')}
            autoComplete="nope"
          />

          <FieldWrapper
            className="mt-2 flex h-8 w-fit flex-row-reverse items-center justify-end gap-x-2"
            label={t('auth:checkbox')}
          >
            <Controller
              control={control}
              name="checked"
              render={({ field: { onChange, value, ...field } }) => {
                return (
                  <Checkbox
                    {...field}
                    className="h-6 w-6"
                    checked={value}
                    onCheckedChange={onChange}
                  />
                )
              }}
            />
          </FieldWrapper>

          <FieldWrapper
            className="mt-2 flex h-8 w-fit flex-row-reverse items-center justify-end gap-x-2"
            label={t('auth:persist_login')}
          >
            <Controller
              control={control}
              name="isPersistLogin"
              render={({ field: { onChange, value, ...field } }) => {
                return (
                  <Checkbox
                    {...field}
                    className="h-6 w-6"
                    checked={value}
                    onCheckedChange={onChange}
                  />
                )
              }}
            />
          </FieldWrapper>

          <div>
            <Button
              isLoading={login.isLoading}
              type="submit"
              className="w-full bg-primary-400"
              variant="primary"
            >
              {t('user:login')}
            </Button>
          </div>
        </>
      </form>

      <div className="py-[13%]">
        <div className="container mx-auto text-center">
          <ul className="text-body-xs">
            <li className="m-1">
              {t('auth:no_account')}{' '}
              <Link to={PATHS.REGISTER} className="font-bold text-black">
                {t('auth:from_login_to_register')}
              </Link>
            </li>
            <li>
              {t('auth:forgot_password')}{' '}
              <Link to={PATHS.FORGETPASSWORD} className="font-bold text-black">
                {t('auth:change_password')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
