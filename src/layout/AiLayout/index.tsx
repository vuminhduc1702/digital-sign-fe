import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ContentLayout } from '../ContentLayout'
import AiNavbar from './components/AiNavbar'
import { useEffect } from 'react'
import storage from '@/utils/storage'
import { PATHS } from '@/routes/PATHS'

export function AiLayout() {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const location = useLocation()

  const projectId = storage.getProject()?.id

  useEffect(() => {
    if (location.pathname === PATHS.AI && projectId != null) {
      navigate(`${PATHS.DDOS}`)
    }
  }, [location.pathname, projectId])

  return (
    <ContentLayout title={t('sidebar:integration.ai.title')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-2">
        <div className="flex flex-col gap-2 md:col-span-2">
          <AiNavbar />
          <Outlet />
        </div>
      </div>
    </ContentLayout>
  )
}
