import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { ContentLayout } from '~/layout/ContentLayout'
import { type Dashboard } from '../types'
import storage from '~/utils/storage'
import { CreateDashboard } from '../components/DashboardTable/CreateDashboard'
import { ComboBoxSelectDashboard } from '../components/DashboardTable/ComboBoxSelectDashboard'
import { DashboardTable } from '../components/DashboardTable'
import Device from 'index'


export function DashboardManage() {
  const { t } = useTranslation()
  Device().

  const ref = useRef(null)

  const { id: projectId } = storage.getProject()

  const [filteredComboboxData, setFilteredComboboxData] = useState<Dashboard[]>(
    [],
  )

  return (
    <ContentLayout title={t('sidebar:cloud.dashboard')}>
      <div ref={ref} className="flex grow flex-col">
        <TitleBar title={t('dashboard:title') ?? 'Dashboard'} />
        <div className="flex grow flex-col px-9 py-3 shadow-lg">
          <div className="flex justify-between">
            <ExportTable refComponent={ref} />
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
      </div>
    </ContentLayout>
  )
}
