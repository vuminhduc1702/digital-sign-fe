import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { SelectField } from '~/components/Form'
import { useEventService } from '../../api/thingServiceAPI'
import { EventServiceTable } from './EventServiceTable'

type ThingServicesTab2Props = {
  serviceName: string
}

export function ThingEventServices({ serviceName }: ThingServicesTab2Props) {
  const [offset, setOffset] = useState(0)

  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(Math.round(Date.now()))
  const [selectValue, setSelectValue] = useState('0')

  const params = useParams()

  const thingId = params.thingId as string

  const {
    data: eventServiceData,
    isPreviousData,
    isSuccess,
  } = useEventService({
    thingId,
    serviceName,
    startTime: selectValue !== '0' ? startTime : null,
    endTime: endTime,
    config: {
      suspense: false,
      keepPreviousData: true,
    },
  })

  const eventSelectData = [
    { value: '0', label: 'All' },
    { value: '1000', label: '1 second' },
    { value: '5000', label: '5 second' },
    { value: '10000', label: '10 second' },
    { value: '15000', label: '15 second' },
    { value: '30000', label: '30 second' },
    { value: '60000', label: '1 minutes' },
    { value: '300000', label: '5 minutes' },
    { value: '600000', label: '10 minutes' },
    { value: '900000', label: '15 minutes' },
    { value: '1800000', label: '30 minutes' },
    { value: '3600000', label: '1 hour' },
    { value: '7200000', label: '2 hours' },
    { value: '18000000', label: '5 hours' },
    { value: '36000000', label: '10 hours' },
    { value: '43200000', label: '12 hours' },
    { value: '86400000', label: '1 day' },
    { value: '604800000', label: '7 days' },
    { value: '2592000000', label: '30 days' },
  ]

  const handleSelect = (e: any) => {
    const startTimeParse = Math.round(Date.now()) - parseInt(e.target.value)
    setStartTime(startTimeParse)
    setEndTime(Math.round(Date.now()))
    setSelectValue(e.target.value)
  }

  return (
    <>
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            {isSuccess ? (
              <SelectField
                value={selectValue}
                options={eventSelectData}
                onChange={handleSelect}
              />
            ) : null}
          </div>
        </div>
        <EventServiceTable
          data={eventServiceData?.data || []}
          offset={offset}
          setOffset={setOffset}
          total={0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
