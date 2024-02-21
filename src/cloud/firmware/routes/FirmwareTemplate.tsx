import { useState } from 'react'

import storage from '~/utils/storage'

import {
  CreateFirmWare,
  FirmWareTable,
} from '../components/Firmware'
import TitleBar from '~/components/Head/TitleBar'
import { useTranslation } from 'react-i18next'
import { useGetFirmwares } from '../api/firmwareAPI'
import { type FirmWare } from '../types'
import { flattenData } from '~/utils/misc'

export function FirmwareTemplate() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<FirmWare[]>(
    [],
  )
  const [offset, setOffset] = useState(0)
  const projectId = storage.getProject()?.id
  const {
    data: firmwareData,
    isPreviousData,
    isSuccess,
  } = useGetFirmwares({
    projectId,
    config: { keepPreviousData: true },
    offset
  })

  const { acc: firmwareFlattenData, extractedPropertyKeys } = flattenData(
    firmwareData?.data,
    [
      'id',
      'name',
      'template_name',
      'version',
      'created_time',
      'tag',
      'created_by',
      'template_id',
      'email',
      'description',
    ],
  )

  return (
    <>
      <TitleBar title={t('cloud:firmware.title')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            <CreateFirmWare />
            {/* dummyInput */}
          </div>
        </div>
        <FirmWareTable
          data={firmwareFlattenData}
          offset={offset}
          setOffset={setOffset}
          total={firmwareData?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
