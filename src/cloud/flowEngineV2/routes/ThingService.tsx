import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import {
  CreateThingService,
  ThingServiceTable,
} from '../components/ThingService'

import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { flattenData } from '~/utils/misc'

export function ThingServices() {
  const { t } = useTranslation()

  const [offset, setOffset] = useState(0)

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

  const { acc: thingServiceFlattenData, extractedPropertyKeys } = flattenData(
    thingData?.data,
    [
      'id',
      'name',
      'create_ts',
      'description',
      'input',
      'output',
      'fail_limit',
      'lock_time',
    ],
  )

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
          </div>
        </div>
        <ThingServiceTable
          data={thingServiceFlattenData}
          offset={offset}
          // setOffset={setOffset}
          total={0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
