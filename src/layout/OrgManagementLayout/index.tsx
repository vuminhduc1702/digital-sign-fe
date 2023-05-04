import { Suspense } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import OrgManageNavbar from './components/Navbar'
import OrgManageSidebar from './components/OrgManageSidebar'
import { ContentLayout } from '../ContentLayout'
import { Spinner } from '~/components/Spinner'

export function OrgManagementLayout() {
  const { t } = useTranslation()
  const { orgId } = useParams()

  return (
    <ContentLayout title={t('sidebar.cloud.org_management')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex h-[89vh] flex-col gap-2 md:col-span-1">
          <OrgManageSidebar />
        </div>

        {orgId ? (
          <div className="flex flex-col gap-2 md:col-span-2">
            {orgId ? <OrgManageNavbar /> : null}
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
        ) : null}
      </div>
    </ContentLayout>
  )
}
