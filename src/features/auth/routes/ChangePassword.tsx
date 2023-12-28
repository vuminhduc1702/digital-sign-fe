import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ChangePaswordForm } from '../components/ChangePasswordForm'
import { logoutFn } from '~/lib/auth'
import { toast } from 'sonner'
import narrowLeft from '~/assets/icons/narrow-left.svg'
import frameAuth from '~/assets/images/frame-auth-layout.svg'
import logo from '~/assets/images/logo.svg'

export const ChangePassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <>
      <div className="h-full p-4">
        <div className="flex items-center pt-2 sm:px-14 lg:px-60">
          <div
            className="mr-auto flex cursor-pointer rounded-md border border-secondary-700 px-3 py-2 text-base font-medium"
            onClick={() => navigate(-1)}
          >
            <img
              src={narrowLeft}
              alt="left"
              className="aspect-square w-[20px]"
            />
            <span className="ml-2">{t('form:back')}</span>
          </div>
        </div>
        <div className="mt-28 flex sm:px-14 lg:px-60">
          <div className="flex w-2/3 shrink flex-col items-center justify-center rounded-s-lg bg-white">
            <div className="flex justify-center pt-[4rem] sm:py-5 lg:pb-5 lg:pt-10">
              <a href="/">
                <img src={logo} alt="" />
              </a>
            </div>
            <div className="flex justify-center pt-[4rem] sm:py-5 lg:pt-5">
              <img src={frameAuth} alt="" />
            </div>
          </div>
          <div className="flex w-1/3 flex-col items-center justify-center bg-white sm:rounded-e-lg">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <h2 className="mb-4 mt-10 text-center text-xl font-extrabold text-gray-900">
                {t('user:reset_password')}
              </h2>
            </div>

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="px-4 py-0  sm:px-10">
                <ChangePaswordForm
                  onSuccess={() => {
                    logoutFn()
                    toast.success(t('auth:success_password'))
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
