import { Link } from 'react-router-dom'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { useRegister } from '~/lib/auth'
import { Form, InputField } from '~/components/Form'
import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'
import { emailSchema, nameSchema, otpSchema } from '~/utils/schemaValidation'

const registerSchema = z.object({
  email: emailSchema,
  password: nameSchema,
  otp: otpSchema,
})

type RegisterValues = {
  email: string
  password: string
  otp: string
}

type RegisterFormProps = {
  onSuccess: () => void
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { t } = useTranslation()

  const registerMutation = useRegister()

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
          return (
            <>
              <InputField
                type="email"
                label="Email"
                error={formState.errors['email']}
                registration={register('email')}
              />
              <InputField
                type="password"
                label={t('user:password') ?? 'Password'}
                error={formState.errors['password']}
                registration={register('password')}
              />
              <InputField
                type="text"
                label="OTP"
                error={formState.errors['otp']}
                registration={register('otp')}
              />

              <div>
                <Button
                  isLoading={registerMutation.isLoading}
                  type="submit"
                  className="w-full"
                >
                  {t('user:register')}
                </Button>
              </div>
            </>
          )
        }}
      </Form>
      <div className="mt-2 flex items-center justify-end">
        <div className="text-body-sm">
          <Link
            to={PATHS.LOGIN}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t('user:login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
