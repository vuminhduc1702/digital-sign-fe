import { useTranslation } from 'react-i18next'

import { ContentLayout } from '@/layout/ContentLayout'
import { RoleSidebar } from '../components'

export function RoleManage() {
  const { t } = useTranslation()

  return (
    <ContentLayout title={t('sidebar:cloud.role_manage')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex grow flex-col gap-2 md:col-span-3">
          <RoleSidebar />
        </div>
      </div>
    </ContentLayout>
  )
}
