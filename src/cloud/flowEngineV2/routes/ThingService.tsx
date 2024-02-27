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
import { InputField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { XMarkIcon } from '@heroicons/react/20/solid'

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
            <InputField
              type="text"
              placeholder={t('table:search')}
              value={searchQuery}
              onChange={e => {
                const value = e.target.value
                setSearchQuery(value)
              }}
              endIcon={
                <div className="absolute top-1/2 right-2 -translate-y-1/2 transform flex justify-center">
                  {searchQuery.length > 0 && (
                    <XMarkIcon
                      className="h-[16px] w-[16px] mr-[5px] transform cursor-pointer opacity-50 flex align-center justify-center cursor-pointer"
                      onClick={() => setSearchQuery('')}
                    />
                  )}
                  <SearchIcon
                    className="cursor-pointer flex justify-between align-center"
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                  />
                </div>
              }
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
