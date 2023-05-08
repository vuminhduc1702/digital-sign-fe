import * as z from 'zod'
import { Button } from '~/components/Button'

import { Form, InputField } from '~/components/Form'
import { Link } from '~/components/Link'
import { useLogin } from '~/lib/auth'
import { PATHS } from '~/routes/PATHS'

const schema = z.object({
  identifier: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
})

type LoginValues = {
  identifier: string
  password: string
}

type LoginFormProps = {
  onSuccess: () => void
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
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
              label="Email Address"
              error={formState.errors['identifier']}
              registration={register('identifier')}
            />
            <InputField
              type="password"
              label="Password"
              error={formState.errors['password']}
              registration={register('password')}
            />
            <div>
              <Button
                isLoading={login.isLoading}
                type="submit"
                className="w-full"
              >
                Log in
              </Button>
            </div>
          </>
        )}
      </Form>
      <div className="mt-2 flex items-center justify-end">
        <div className="text-sm">
          <Link
            to={PATHS.REGISTER}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
