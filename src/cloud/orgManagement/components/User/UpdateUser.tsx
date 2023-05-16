import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { Button } from '~/components/Button'
import { Form, InputField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { userSchema } from './CreateUser'
import { type UpdateUserDTO, useUpdateUser } from '../../api/userAPI'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

type UpdateUserProps = {
  userId: string
  name: string
  email: string
  close: () => void
  isOpen: boolean
}
export function UpdateUser({
  userId,
  name,
  close,
  isOpen,
  email,
}: UpdateUserProps) {
  const { t } = useTranslation()

  const { orgId } = useParams()

  const { mutate, isLoading, isSuccess } = useUpdateUser()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud.org_manage.user_manage.add_user.edit')}
      renderFooter={() => (
        <>
          <Button
            className="rounded border-none"
            variant="secondary"
            size="lg"
            onClick={close}
            startIcon={
              <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
            }
          />
          <Button
            className="rounded border-none"
            form="update-user"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </>
      )}
    >
      <Form<UpdateUserDTO['data'], typeof userSchema>
        id="update-user"
        onSubmit={values =>
          mutate({
            data: {
              name: values.name,
              email: values.email,
              password: values.password,
            },
            userId,
          })
        }
        schema={userSchema}
        options={{
          defaultValues: { name, email, org_id: orgId },
        }}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={
                t('cloud.org_manage.user_manage.add_user.name') ?? "User's name"
              }
              error={formState.errors['name']}
              registration={register('name')}
            />
            <InputField
              label={
                t('cloud.org_manage.user_manage.add_user.email') ??
                "User's email"
              }
              error={formState.errors['email']}
              registration={register('email')}
            />
            <InputField
              label={
                t('cloud.org_manage.user_manage.add_user.password') ??
                'Password'
              }
              error={formState.errors['password']}
              registration={register('password')}
            />
            <InputField
              label={
                t('cloud.org_manage.user_manage.add_user.confirm_password') ??
                'Confirm password'
              }
              error={formState.errors['confirmPassword']}
              registration={register('confirmPassword')}
            />
          </>
        )}
      </Form>
    </Drawer>
  )
}
