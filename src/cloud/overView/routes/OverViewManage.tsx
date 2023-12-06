import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { Spinner } from '~/components/Spinner'
import { ContentLayout } from '~/layout/ContentLayout'
import storage from '~/utils/storage'
import { LayoutOverView, OverViewSidebar } from '../components'

export function OverViewManage() {
  const { t } = useTranslation()

  const { packageId } = useParams()

  const projectId = storage.getProject()?.id

  return (
    <ContentLayout title={t('sidebar:overview')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-4">
        <div className="flex flex-col gap-2 md:col-span-3">
          <Suspense
            fallback={
              <div className="flex grow items-center justify-center md:col-span-2">
                <Spinner size="xl" />
              </div>
            }
          >
            <LayoutOverView />
          </Suspense>
        </div>
        <div className="flex grow flex-col gap-2 md:col-span-1">
          <OverViewSidebar />
        </div>
      </div>
    </ContentLayout>
  )
}
