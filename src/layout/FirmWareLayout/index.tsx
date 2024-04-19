import { Outlet, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ContentLayout } from '../ContentLayout'

export function FirmWareLayout() {
  const { t } = useTranslation()
  const { projectId } = useParams()

  return (
    <ContentLayout title={t('sidebar:cloud.firm_ware')}>
      {projectId ? (
        <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <Outlet />
          </div>
        </div>
      ) : null}
    </ContentLayout>
  )
}
