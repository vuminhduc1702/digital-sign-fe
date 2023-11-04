import { useTranslation } from 'react-i18next'

import { Link } from '~/components/Link'
import { Form, InputField } from '~/components/Form'
import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'

import { BtnPasswordLoginIcon } from '~/components/SVGIcons'
import { useChangePassword } from '../api/changepassword'

import {
  ChangePaswordSchema,
  type changePasswordDTO,
} from '../api/changepassword'

type ChangePaswordFormProps = {
  onSuccess: () => void
}

export const ChangePaswordForm = ({ onSuccess }: ChangePaswordFormProps) => {
  const { t } = useTranslation()

  const changePasswordMutation = useChangePassword()

  return (
    <div>
      <Form<changePasswordDTO['data'], typeof ChangePaswordSchema>
        onSubmit={async values => {
          await changePasswordMutation.mutateAsync(values)
          onSuccess()
        }}
        schema={ChangePaswordSchema}
        options={{
          shouldUnregister: true,
        }}
      >
        {({ register, formState }) => {
          return (
            <>
              <InputField
                type="password"
                className="bg-stone-300"
                classnamefieldwrapper="relative"
                placeholder={t('auth:require_password_old')}
                error={formState.errors['old_password']}
                registration={register('old_password')}
                startIcon={
                  <BtnPasswordLoginIcon
                    height={20}
                    width={20}
                    viewBox="0 0 20 20"
                    className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                  />
                }
                autoComplete="off"
              />

              <InputField
                type="password"
                className="bg-stone-300"
                classnamefieldwrapper="relative"
                placeholder={t('auth:require_password_new')}
                error={formState.errors['new_password']}
                registration={register('new_password')}
                startIcon={
                  <BtnPasswordLoginIcon
                    height={20}
                    width={20}
                    viewBox="0 0 20 20"
                    className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                  />
                }
                autoComplete="new-password"
              />
              <InputField
                type="password"
                className="bg-stone-300"
                classnamefieldwrapper="relative"
                error={formState.errors['new_password_confirm']}
                registration={register('new_password_confirm')}
                placeholder={t('auth:confirm_password')}
                startIcon={
                  <BtnPasswordLoginIcon
                    height={20}
                    width={20}
                    viewBox="0 0 20 20"
                    className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                  />
                }
                autoComplete="new-password"
              />
              <div className="container mx-auto text-center text-body-xs">
                <Button
                  isLoading={changePasswordMutation.isLoading}
                  type="submit"
                  className="w-full bg-primary-400"
                >
                  {t('btn:confirm')}
                </Button>
              </div>
            </>
          )
        }}
      </Form>
      <div className="mt-8 flex justify-end">
        <div className="text-body-sm text-black">
          <Link to={PATHS.HOME} className="font-bold text-red-500">
            {t('auth:back_to_home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
