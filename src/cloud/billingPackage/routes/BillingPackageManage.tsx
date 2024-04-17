import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { ContentLayout } from '~/layout/ContentLayout'
import storage from '~/utils/storage'
import { PackageInfo, PackageSidebar } from '../components'

export function BillingPackageManage() {
  const { t } = useTranslation()

  const { packageId } = useParams()

  const projectId = storage.getProject()?.id

  return (
    <ContentLayout title={t('sidebar:payment.plgc')}>
      <div className="grid grow grid-cols-1 gap-x-4 px-2 pt-2 md:grid-cols-4">
        <div className="flex grow flex-col gap-2 md:col-span-1">
          <PackageSidebar />
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto px-5 pb-2 md:col-span-3">
          {projectId && packageId ? (
            <PackageInfo />
          ) : (
            <div className="flex grow items-center justify-center md:col-span-4">
              {t('billing:package_manage.choose_package')}
            </div>
          )}
        </div>
      </div>
    </ContentLayout>
  )
}
