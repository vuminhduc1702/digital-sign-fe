import { Link } from 'react-router-dom'
import * as z from 'zod'

import { useRegister } from '~/lib/auth'
import { Form, InputField } from '~/components/Form'
import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'

const schema = z.object({
  email: z.string().min(1, 'Required'),
  firstName: z.string().min(1, 'Required'),
  otp: z.string().min(1, 'Required'),
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
  const registerMutation = useRegister()

  return (
    <div>
      <Form<RegisterValues, typeof schema>
        onSubmit={async values => {
          await registerMutation.mutate(values)
          onSuccess()
        }}
        schema={schema}
        options={{
          shouldUnregister: true,
        }}
      >
        {({ register, formState }) => (
          <>
            <InputField
              type="email"
              label="Email Address"
              error={formState.errors['email']}
              registration={register('email')}
            />
            <InputField
              type="password"
              label="Password"
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
                Register
              </Button>
            </div>
          </>
        )}
      </Form>
      <div className="mt-2 flex items-center justify-end">
        <div className="text-sm">
          <Link
            to={PATHS.LOGIN}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
