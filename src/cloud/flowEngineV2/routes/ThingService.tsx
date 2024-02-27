import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import {
  CreateThingService,
  ThingServiceTable,
} from '../components/ThingService'
import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { SearchField } from '~/components/Input'

export function ThingServices() {
  const { t } = useTranslation()

  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const params = useParams()

  const thingId = params.thingId as string

  // no offset call
  const {
    data: thingData,
    isPreviousData,
    isSuccess,
  } = useGetServiceThings({
    thingId,
    config: { keepPreviousData: true },
  })

  return (
    <>
      <TitleBar
        title={t('cloud:custom_protocol.service.title_thing_service')}
      />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            <CreateThingService thingServiceData={thingData?.data} />
            {/* dummyInput */}
            <SearchField
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
        <ThingServiceTable
          data={thingData?.data ?? []}
          offset={offset}
          // setOffset={setOffset}
          total={0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
