import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

// import {
//   CreateDevice,
//   DeviceTable,
//   ComboBoxSelectDevice,
// } from '../components/Device'
import { useGetEntityThings } from '../api/thingAPI'
import storage from '~/utils/storage'

import { type EntityThing } from '../types'
import { ComboBoxSelectThing, CreateThing, ThingTable } from '../components/Attributes'

export function ThingTemplate() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<EntityThing[]>([])
  const [offset, setOffset] = useState(0)
  const { id: projectId } = storage.getProject()
  const {
    data: thingData,
    isPreviousData,
    isSuccess,
  } = useGetEntityThings({
    projectId,
    config: { keepPreviousData: true },
  })

  return (
    <>
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            <CreateThing />
            {isSuccess ? (
              <ComboBoxSelectThing
                data={thingData.data}
                setFilteredComboboxData={setFilteredComboboxData}
                offset={offset}
              />
            ) : null}
          </div>
        </div>
        <ThingTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={thingData?.data?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
