import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { ComboBoxSelectThingService, CreateThingService, ThingServiceTable } from '../components/ThingService'
import { useGetThingServices } from '../api/thingServiceAPI'
import storage from '~/utils/storage'

import { type ThingService } from '../types'

export function ThingServices() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<ThingService[]>(
    [],
  )
  const [offset, setOffset] = useState(0)

  const params = useParams()

  const thingId = params.thingId as string
  const { id: projectId } = storage.getProject()

  const {
    data: thingData,
    isPreviousData,
    isSuccess,
  } = useGetThingServices({
    thingId,
    config: { keepPreviousData: true },
  })

  console.log(thingData, '==================thingData')

  return (
    <>
      <TitleBar
        title={t('cloud:custom_protocol.service.title_thing_service')}
      />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            <CreateThingService />
            {isSuccess ? (
              <ComboBoxSelectThingService
                data={thingData.data}
                setFilteredComboboxData={setFilteredComboboxData}
                offset={offset}
              />
            ) : null}
          </div>
        </div>
        <ThingServiceTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
