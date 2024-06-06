import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Head } from '@/components/Head'

import textureLogin from '@/assets/images/texture-auth-layout.svg'
import frameAuth from '@/assets/images/frame-auth-layout.svg'
import logo from '@/assets/images/logo.svg'

type LayoutProps = {
  children: ReactNode
  title: string
}

export const Layout = ({ children, title }: LayoutProps) => {
  const { t } = useTranslation()
  return (
    <>
      <Head title={title} />

      <div className="relative min-h-screen bg-white">
        <div className="flex items-center justify-center h-[90vh] pb-20 pt-[7.5rem] sm:px-14 lg:px-60">
          <div className="flex w-1/2 flex-col items-center justify-center border border-secondary-900 bg-white rounded-lg">
            <div>
              <h2 className="mb-4 mt-10 text-center text-xl font-extrabold text-gray-900">
                {title}
              </h2>
            </div>
            <div className="sm:w-full">
              <div className="px-4 py-0 sm:px-10">{children}</div>
            </div>
          </div>
        </div>
        {/* <footer className="absolute bottom-5 left-1/2 -translate-x-1/2 py-0">
          <div className="container mx-auto text-center">
            <ul className="text-body-xs">
              <li>
                {t('auth:footer_text_1').replace(
                  '{{YEAR}}',
                  String(new Date().getFullYear()),
                )}
              </li>
              <li>{t('auth:footer_text_2')}</li>
            </ul>
          </div>
        </footer> */}
      </div>
    </>
  )
}
