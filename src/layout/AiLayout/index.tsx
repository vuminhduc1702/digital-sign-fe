import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ContentLayout } from '../ContentLayout'
import { Spinner } from '~/components/Spinner'
import AiNavbar from './components/AiNavbar'

export function AiLayout() {
  const { t } = useTranslation()

  return (
    <ContentLayout title={t('sidebar:intergration.ai')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-2">
        <div className="flex flex-col gap-2 md:col-span-2">
          <AiNavbar />
          <Suspense
            fallback={
              <div className="flex grow items-center justify-center md:col-span-2">
                <Spinner size="xl" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
    </ContentLayout>
  )
}
