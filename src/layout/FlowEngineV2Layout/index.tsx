import { Suspense } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import FlowEngineV2Navbar from './components/Navbar'
import { ContentLayout } from '../ContentLayout'
import { Spinner } from '~/components/Spinner'

export function FlowEngineV2Layout() {
  const { t } = useTranslation()
  const { projectId } = useParams()

  return (
    <ContentLayout title={t('sidebar:cloud.org_management')}>
      {projectId ? (
        <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <FlowEngineV2Navbar />
            <Suspense
              fallback={
                <div className="flex grow items-center justify-center md:col-span-2">
                  <Spinner size="xl" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </div>
      ) : null}
    </ContentLayout>
  )
}
