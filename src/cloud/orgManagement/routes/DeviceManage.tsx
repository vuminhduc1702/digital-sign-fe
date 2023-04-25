import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { CreateDevice, DeviceTable } from '../components/Device'
import { ComboBoxSelectDevice } from '../components/Device/ComboBoxSelectDevice'

import { type PropertyValuePair } from '~/utils/misc'

function DeviceManage() {
  const { t } = useTranslation()

  const { orgId } = useParams()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    PropertyValuePair<string>[]
  >([])

  return (
    <div className="flex grow flex-col">
      {orgId ? (
        <div className="flex grow flex-col gap-y-3">
          <TitleBar title={t('cloud.org_manage.device_manage.header')} />
          <div className="flex grow flex-col px-9 py-4 shadow-lg">
            <div className="flex justify-between">
              <ExportTable />
              <div className="flex items-center gap-x-3">
                <CreateDevice entityId={orgId} />
                <ComboBoxSelectDevice
                  setFilteredComboboxData={setFilteredComboboxData}
                />
              </div>
            </div>
            <DeviceTable data={filteredComboboxData} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DeviceManage
