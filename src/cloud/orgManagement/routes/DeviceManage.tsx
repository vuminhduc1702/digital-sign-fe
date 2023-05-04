import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { CreateDevice, DeviceTable } from '../components/Device'
import { ComboBoxSelectDevice } from '../components/Device/ComboBoxSelectDevice'

import { type Device } from '../types'
import { useParams } from 'react-router-dom'
import { useProjectIdStore } from '~/stores/project'
import { useGetDevices } from '../api/deviceAPI'

export function DeviceManage() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<Device[]>([])
  const [offset, setOffset] = useState(0)

  const params = useParams()
  const orgId = params.orgId as string
  const projectId = useProjectIdStore(state => state.projectId)
  const { data: deviceData } = useGetDevices({ orgId, projectId, offset })

  return (
    <>
      <TitleBar
        title={
          t('cloud.org_manage.device_manage.header') ?? 'Device management'
        }
      />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable />
          <div className="flex items-center gap-x-3">
            <CreateDevice />
            <ComboBoxSelectDevice
              data={deviceData}
              setFilteredComboboxData={setFilteredComboboxData}
              offset={offset}
            />
          </div>
        </div>
        <DeviceTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={deviceData?.total ?? 0}
        />
      </div>
    </>
  )
}
