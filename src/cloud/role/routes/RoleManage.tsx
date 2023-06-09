import { useParams } from 'react-router-dom'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { ContentLayout } from '~/layout/ContentLayout'
import { Spinner } from '~/components/Spinner'
import { useProjectIdStore } from '~/stores/project'
import { PolicyTable, RoleSidebar } from '../components'

export function RoleManage() {
  const { t } = useTranslation()

  const { roleId } = useParams()

  const projectId = useProjectIdStore(state => state.projectId)

  return (
    <ContentLayout title={t('sidebar:cloud.role_manage')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex h-[88.8vh] flex-col gap-2 md:col-span-1">
          <RoleSidebar />
        </div>

        {projectId && roleId ? (
          <div className="flex flex-col gap-2 md:col-span-2">
            <Suspense
              fallback={
                <div className="flex grow items-center justify-center md:col-span-2">
                  <Spinner size="xl" />
                </div>
              }
            >
              <TitleBar
                title={
                  t('cloud:role_manage.add_policy.title') ??
                  'Role policy management'
                }
              />
              <div className="flex grow flex-col px-9 py-3 shadow-lg">
                <div className="flex justify-between">
                  <ExportTable />
                </div>
                <PolicyTable />
              </div>
            </Suspense>
          </div>
        ) : null}
      </div>
    </ContentLayout>
  )
}

;<a></a>
