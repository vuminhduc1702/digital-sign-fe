import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { ContentLayout } from '~/layout/ContentLayout'
import { type Dashboard } from '../types'
import { DashboardTable } from '../components'
import storage from '~/utils/storage'
import { CreateDashboard } from '../components/DashboardTable/CreateDashboard'
import { ComboBoxSelectDashboard } from '../components/DashboardTable/ComboBoxSelectDashboard'

export function DashboardManage() {
  const { t } = useTranslation()

  // const params = useParams()

  const { id: projectId } = storage.getProject()

  const [filteredComboboxData, setFilteredComboboxData] = useState<Dashboard[]>(
    [],
  )

  return (
    <ContentLayout title={t('sidebar:cloud.dashboard')}>
      <TitleBar title={t('dashboard:title') ?? 'Dashboard'} />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable />
          <div className="flex items-center gap-x-3">
            <CreateDashboard projectId={projectId} />
            <ComboBoxSelectDashboard
              projectId={projectId}
              setFilteredComboboxData={setFilteredComboboxData}
            />
          </div>
        </div>
        <DashboardTable data={filteredComboboxData} projectId={projectId} />
      </div>
    </ContentLayout>
  )
}
