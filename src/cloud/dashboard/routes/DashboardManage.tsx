import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { CreateDashboard } from '../components/DashboardTable/CreateDashboard'
import { type Dashboard, DashboardTable } from '../components/DashboardTable'
import { limitPagination } from '~/utils/const'
import { useGetDashboards } from '../api'
import { flattenData } from '~/utils/misc'

export function DashboardManage() {
  const { t } = useTranslation()

  const ref = useRef(null)

  const projectId = storage.getProject()?.id

  const [offset, setOffset] = useState(0)

  const { data: dashboardData, isPreviousData, isSuccess } = useGetDashboards({ projectId, offset })

  const { acc: dashboardFlattenData, extractedPropertyKeys } = flattenData(
    dashboardData?.dashboard,
    ['id', 'title', 'name', 'tenant_id', 'created_time', 'configuration'],
  )

  console.log(dashboardData)

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:dashboard.title')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable refComponent={ref} />
          <div className="flex items-center gap-x-3">
            <CreateDashboard projectId={projectId} />
            {/* dummyInput */}
          </div>
        </div>
        <DashboardTable
          data={dashboardFlattenData}
          projectId={projectId}
          offset={offset}
          setOffset={setOffset}
          total={dashboardData?.total || 0}
          limitPagination={limitPagination}
        />
      </div>
    </div>
  )
}
