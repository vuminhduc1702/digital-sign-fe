import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import Navbar from './components/Navbar'
import Search from './components/Search'
import OrgMap from './components/OrgMap'
import { ContentLayout } from '../ContentLayout'
import { Spinner } from '~/components/Spinner'

function OrgManagementLayout() {
  const { t } = useTranslation()

  return (
    <ContentLayout title={t('sidebar.cloud.org_management')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex flex-col gap-2 md:col-span-1">
          <Search />
          <OrgMap />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <Navbar />
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

export default OrgManagementLayout
