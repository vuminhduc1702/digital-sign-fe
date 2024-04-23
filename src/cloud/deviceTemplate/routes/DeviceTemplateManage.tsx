import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import { ContentLayout } from '@/layout/ContentLayout'
import { TemplateSidebar } from '../components'

export function DeviceTemplateManage() {
  const { t } = useTranslation()
  return (
    <ContentLayout title={t('sidebar:cloud.device_template')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex grow flex-col gap-2 md:col-span-1">
          <TemplateSidebar />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Outlet />
        </div>
      </div>
    </ContentLayout>
  )
}
