import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import OrgManageNavbar from './components/Navbar'
import OrgManageSidebar from './components/OrgManageSidebar'
import { ContentLayout } from '../ContentLayout'
import storage from '@/utils/storage'
import { useEffect } from 'react'
import { PATHS } from '@/routes/PATHS'

export function OrgManagementLayout() {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const location = useLocation()

  const projectId = storage.getProject()?.id

  useEffect(() => {
    if (location.pathname === PATHS.ORG && projectId != null) {
      navigate(`${PATHS.ORG_MANAGE}/${projectId}`)
    }
  }, [location.pathname, projectId])

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
