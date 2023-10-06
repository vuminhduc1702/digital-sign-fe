import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { Button } from '~/components/Button'

import { Form, InputField } from '~/components/Form'
import { CheckBox } from './CheckBox'
import { Link } from '~/components/Link'
import { useLogin } from '~/lib/auth'
import { PATHS } from '~/routes/PATHS'
import { emailSchema, passwordSchema } from '~/utils/schemaValidation'

import { BtnPasswordLoginIcon } from '~/components/SVGIcons'
import { BtnUserLoginIcon } from '~/components/SVGIcons'

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

  const login = useLogin()

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
              placeholder={t('auth:require_email')}
              // classNameError="absolute top-100%"
              startIcon={
                <BtnUserLoginIcon
                  height={20}
                  width={20}
                  viewBox="0 0 20 20"
                  className="absolute left--5 top--5  z-20 m-2 h-5 w-5 border-e-red-600 hover:text-primary-400"
                />
              }
              error={formState.errors['identifier']}
              registration={register('identifier')}
            />
            <InputField
              type="password"
              // classNameError="absolute top-100%"
              placeholder={t('user:password')}
              className="bg-stone-300"
              startIcon={
                <BtnPasswordLoginIcon
                  height={20}
                  width={20}
                  viewBox="0 0 20 20"
                  className="absolute left--5 top--5  z-20 m-2 h-5 w-5 hover:text-primary-400"
                />
              }
              error={formState.errors['password']}
              registration={register('password')}
            />

            <CheckBox label={t('auth:checkbox')} />
            <div>
              <Button
                isLoading={login.isLoading}
                type="submit"
                className="w-full bg-stone-500"
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
          <ul className="text-xs">
            <li className="m-1">
              {t('auth:no_account')}{' '}
              <Link
                to={PATHS.REGISTER}
                className="font-bold text-black hover:text-blue-500"
              >
                {t('auth:from_login_to_register')}
              </Link>
            </li>
            <li>
              {t('auth:forgot_password')}{' '}
              <Link
                to={PATHS.REGISTER}
                className="font-bold text-black hover:text-blue-500"
              >
                {t('auth:change_password')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
