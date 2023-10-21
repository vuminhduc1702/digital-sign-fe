import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { Button } from '~/components/Button'

import { FieldWrapper, Form, InputField } from '~/components/Form'
import { Link } from '~/components/Link'
import { useLogin } from '~/lib/auth'
import { PATHS } from '~/routes/PATHS'
import { emailSchema, passwordSchema } from '~/utils/schemaValidation'
import { Checkbox } from '~/components/Checkbox'

import {
  BtnPasswordLoginIcon,
  BtnUserLoginIcon,
  EyeHide,
  EyeShow,
} from '~/components/SVGIcons'
import { useState } from 'react'
import { content } from 'html2canvas/dist/types/css/property-descriptors/content'
import { divIcon } from 'leaflet'

const schema = z.object({
  identifier: emailSchema,
  password: passwordSchema,
})

type LoginValues = {
  identifier: string
  password: string
}

type LoginFormProps = {
  onSuccess: () => void
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <div>
      <Form<LoginValues>
        onSubmit={async values => {
          await login.mutateAsync(values)
          onSuccess()
        }}
        schema={schema}
      >
        {({ register, formState }) => (
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
              error={formState.errors['password']}
              registration={register('password')}
            />

            <FieldWrapper
              className="mt-2 flex h-8 flex-row-reverse items-center justify-end gap-x-2"
              label={t('auth:checkbox')}
            >
              <Checkbox />
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
        )}
      </Form>

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
