import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Head } from '~/components/Head'
import { Login } from '../routes/Login'

import textureLogin from '~/assets/images/texture-auth-layout.svg'
import frameAuth from '~/assets/images/frame-auth-layout.svg'
import logoAuth from '~/assets/images/logo-auth-layout.svg'

type LayoutProps = {
  children: ReactNode
  title: string
}

export const Layout = ({ children, title }: LayoutProps) => {
  const { t } = useTranslation()
  return (
    <>
      <Head title={title} />

      <div
        className="relative max-h-screen min-h-screen bg-neutral-600 "
        style={{ backgroundImage: `url(${textureLogin})` }}
      >
        <div className="flex h-[99.3vh] pb-20 pt-[7.5rem] sm:px-14 lg:px-60">
          <div className="w-2/3  shrink rounded-s-lg bg-white">
            <div className="flex justify-center pt-[4rem] sm:py-5 lg:pb-5 lg:pt-10">
              <img src={logoAuth} alt="" />
            </div>
            <div className="flex justify-center pt-[4rem] sm:py-5 lg:pt-5">
              <img src={frameAuth} alt="" />
            </div>
          </div>
          <div className="w-1/3  bg-white sm:rounded-e-lg">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <h2 className="mb-4 mt-10 text-center text-xl font-extrabold text-gray-900">
                {title}
              </h2>
            </div>

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="px-4 py-0  sm:px-10">{children}</div>
            </div>
          </div>
        </div>
        <footer className="absolute bottom-5 left-1/2  -translate-x-1/2 py-0">
          <div className="container mx-auto text-center">
            <ul className="text-xs">
              <li>{t('auth:footer_text_1')}</li>
              <li>{t('auth:footer_text_2')}</li>
            </ul>
          </div>
        </footer>
      </div>
    </>
  )
}
