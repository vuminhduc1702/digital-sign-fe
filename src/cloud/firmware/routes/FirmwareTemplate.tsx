import { useState } from 'react'

import storage from '~/utils/storage'

import { type EntityThing } from '~/cloud/customProtocol'
import {
  ComboBoxSelectFirmWare,
  CreateThing,
  FirmWareTable,
} from '../components/Firmware'
import TitleBar from '~/components/Head/TitleBar'
import { useTranslation } from 'react-i18next'
import { useGetFirmwares } from '../api/firmwareAPI'
import { type FirmWare } from '../types'

export function FirmwareTemplate() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<FirmWare[]>(
    [],
  )
  const [offset, setOffset] = useState(0)
  const { id: projectId } = storage.getProject()
  const {
    data: firmwareData,
    isPreviousData,
    isSuccess,
  } = useGetFirmwares({
    projectId,
    config: { keepPreviousData: true },
  })

  return (
    <>
      <TitleBar title={t('cloud:firmware.title')} />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            <CreateThing />
            {isSuccess ? (
              <ComboBoxSelectFirmWare
                data={firmwareData}
                setFilteredComboboxData={setFilteredComboboxData}
                offset={offset}
              />
            ) : null}
          </div>
        </div>
        <FirmWareTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={firmwareData?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
