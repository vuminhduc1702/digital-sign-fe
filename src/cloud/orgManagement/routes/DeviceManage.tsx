import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { ComboBoxAttrTable, CreateAttr } from '../components/Attributes'
import { useOrgIdStore } from '~/stores/org'
import { DeviceTable } from '../components/Device'

import { type PropertyValuePair } from '~/utils/misc'

import { SearchIcon } from '~/components/SVGIcons'

function DeviceManage() {
  const { t } = useTranslation()

  const orgId = useOrgIdStore(state => state.orgId)

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
                <CreateAttr entityId={orgId} entityType="ORGANIZATION" />
                <ComboBoxAttrTable
                  setFilteredComboboxData={setFilteredComboboxData}
                  startIcon={
                    <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
                  }
                />
              </div>
            </div>
            <DeviceTable
              data={filteredComboboxData}
              entityId={orgId}
              entityType="ORGANIZATION"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DeviceManage
