import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'

import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { type ThingService } from '../../types'
import { ComboBoxSelectThingService } from './ComboBoxSelectThingService'
import { ThingServiceTable } from './ThingServiceTable'
import { useEventService } from '../../api/thingServiceAPI'

type ThingServicesTab2Props = {
  serviceName: string
}

export function ThingServicesTab2({ serviceName }: ThingServicesTab2Props) {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    ThingService[]
  >([])
  const [offset, setOffset] = useState(0)

  const [startTime, setStartTime] = useState(0)

  const params = useParams()

  const thingId = params.thingId as string

  const {
    data: eventServiceData,
  } = useEventService({
    thingId,
    serviceName,
    startTime: startTime,
    endTime: 1692007126,
    config: {
      suspense: false,
    },
  })


  return (
    <>
      <div onClick={() => setStartTime(startTime + 1)} className="flex grow flex-col px-9 py-3 shadow-lg">
        {/* <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            {isSuccess ? (
              <ComboBoxSelectThingService
                data={thingData.data}
                setFilteredComboboxData={setFilteredComboboxData}
                offset={offset}
              />
            ) : null}
          </div>
        </div> */}
        hahaahahah
        {/* <ThingServiceTable
          data={[]}
          offset={offset}
          setOffset={setOffset}
          total={0}
          isPreviousData={isPreviousData}
        /> */}
      </div>
    </>
  )
}
