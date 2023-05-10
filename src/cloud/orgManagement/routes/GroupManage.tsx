import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'

export function GroupManage() {
  const { t } = useTranslation()

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
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
