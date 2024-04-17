import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ContentLayout } from '../ContentLayout'
import AiNavbar from './components/AiNavbar'

export function AiLayout() {
  const { t } = useTranslation()

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
