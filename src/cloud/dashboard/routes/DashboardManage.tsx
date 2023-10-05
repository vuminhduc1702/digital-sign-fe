import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { CreateDashboard } from '../components/DashboardTable/CreateDashboard'
import { ComboBoxSelectDashboard } from '../components/DashboardTable/ComboBoxSelectDashboard'
import { type Dashboard, DashboardTable } from '../components/DashboardTable'

export function DashboardManage() {
  const { t } = useTranslation()

  const ref = useRef(null)

  const { id: projectId } = storage.getProject()

  const [filteredComboboxData, setFilteredComboboxData] = useState<Dashboard[]>(
    [],
  )

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:dashboard.title')} />
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
  )
}
