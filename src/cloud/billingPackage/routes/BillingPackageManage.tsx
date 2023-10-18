import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { Spinner } from '~/components/Spinner'
import { ContentLayout } from '~/layout/ContentLayout'
import storage from '~/utils/storage'
import { PackageInfo, PackageSidebar } from '../components'

export function BillingPackageManage() {
  const { t } = useTranslation()

  const { packageId } = useParams()

  const { id: projectId } = storage.getProject()

  return (
    <ContentLayout title={t('sidebar:payment.plgc')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex grow flex-col gap-2 md:col-span-1">
          <PackageSidebar />
        </div>

        {projectId && packageId ? (
          <div className="flex flex-col gap-2 md:col-span-2">
            <Suspense
              fallback={
                <div className="flex grow items-center justify-center md:col-span-2">
                  <Spinner size="xl" />
                </div>
              }
            >
              <PackageInfo />
            </Suspense>
          </div>
        ) : (
          <div className="flex flex-col gap-2 md:col-span-2">
            Vui lòng chọn gói cước để xem chi tiết
          </div>
        )}
      </div>
    </ContentLayout>
  )
}