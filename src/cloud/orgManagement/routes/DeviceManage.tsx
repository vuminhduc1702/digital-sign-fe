import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import {
  CreateDevice,
  DeviceTable,
  ComboBoxSelectDevice,
} from '../components/Device'

import { type Device } from '../types'
import { useProjectIdStore } from '~/stores/project'
import { useGetDevices } from '../api/deviceAPI'

export function DeviceManage() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<Device[]>([])
  const [offset, setOffset] = useState(0)

  const params = useParams()

  const orgId = params.orgId as string
  const projectId = useProjectIdStore(state => state.projectId)
  const {
    data: deviceData,
    isPreviousData,
    isSuccess,
  } = useGetDevices({
    orgId,
    projectId,
    offset,
    config: { keepPreviousData: true },
  })

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
            {isSuccess ? (
              <ComboBoxSelectDevice
                data={deviceData}
                setFilteredComboboxData={setFilteredComboboxData}
                offset={offset}
              />
            ) : null}
          </div>
        </div>
        <DeviceTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={deviceData?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
