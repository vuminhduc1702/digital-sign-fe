import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { CreateDevice, DeviceTable } from '../components/Device'
import { ComboBoxSelectDevice } from '../components/Device/ComboBoxSelectDevice'

import { type PropertyValuePair } from '~/utils/misc'

export function DeviceManage() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    PropertyValuePair<string>[]
  >([])

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
              setFilteredComboboxData={setFilteredComboboxData}
            />
          </div>
        </div>
        <DeviceTable data={filteredComboboxData} />
      </div>
    </>
  )
}
