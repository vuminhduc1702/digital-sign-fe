import { useTranslation } from 'react-i18next'

import { Form, InputField } from '~/components/Form'
import { Button } from '~/components/Button'

import { BtnPasswordLoginIcon, EyeHide, EyeShow } from '~/components/SVGIcons'

import {
  useChangePassword,
  ChangePaswordSchema,
  type changePasswordDTO,
} from '../api/changepassword'
import { useState } from 'react'

type ChangePaswordFormProps = {
  onSuccess: () => void
}

export const ChangePaswordForm = ({ onSuccess }: ChangePaswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(prev => !prev)
  }
  const toggleRePasswordVisibility = () => {
    setShowRePassword(prev => !prev)
  }
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }
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
                type={showOldPassword ? 'text' : 'password'}
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
                endIcon={
                  showOldPassword ? (
                    <EyeShow
                      height={24}
                      width={24}
                      viewBox="0 0 24 24"
                      className="absolute right-2 top-1/2 z-20 -translate-y-1/2"
                      onClick={toggleOldPasswordVisibility}
                    />
                  ) : (
                    <EyeHide
                      height={24}
                      width={24}
                      viewBox="0 0 24 24"
                      className="absolute right-2 top-1/2 z-20 -translate-y-1/2"
                      onClick={toggleOldPasswordVisibility}
                    />
                  )
                }
                autoComplete="off"
              />

              <InputField
                type={showPassword ? 'text' : 'password'}
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
                autoComplete="new-password"
              />
              <InputField
                type={showRePassword ? 'text' : 'password'}
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
                endIcon={
                  showRePassword ? (
                    <EyeShow
                      height={24}
                      width={24}
                      viewBox="0 0 24 24"
                      className="absolute right-2 top-1/2 z-20 -translate-y-1/2"
                      onClick={toggleRePasswordVisibility}
                    />
                  ) : (
                    <EyeHide
                      height={24}
                      width={24}
                      viewBox="0 0 24 24"
                      className="absolute right-2 top-1/2 z-20 -translate-y-1/2"
                      onClick={toggleRePasswordVisibility}
                    />
                  )
                }
                autoComplete="new-password"
              />
              <div className="text-body-xs container mx-auto text-center">
                <Button
                  isLoading={changePasswordMutation.isLoading}
                  type="submit"
                  className="bg-primary-400 w-full"
                >
                  {t('btn:confirm')}
                </Button>
              </div>
            </>
          )
        }}
      </Form>
    </div>
  )
}
