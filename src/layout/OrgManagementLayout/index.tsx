import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import OrgManageNavbar from './components/Navbar'
import OrgManageSidebar from './components/OrgManageSidebar'
import { ContentLayout } from '../ContentLayout'

export function OrgManagementLayout() {
  const { t } = useTranslation()

  return (
    <ContentLayout title={t('sidebar:cloud.org_management')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex grow flex-col gap-2 md:col-span-1">
          <OrgManageSidebar />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <OrgManageNavbar />
          <Outlet />
        </div>
      </div>
    </ContentLayout>
  )
}
