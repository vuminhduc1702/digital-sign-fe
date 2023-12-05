import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import storage from '~/utils/storage'
import { useGetEntityThings } from '~/cloud/customProtocol/api/entityThing'
import {
  ComboBoxSelectThing,
  CreateThing,
  ThingTable,
} from '../components/Attributes'
import TitleBar from '~/components/Head/TitleBar'

import { type EntityThing } from '~/cloud/customProtocol'

export function ThingTemplate() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    EntityThing[]
  >([])
  const [offset, setOffset] = useState(0)
  const { id: projectId } = storage.getProject()
  const {
    data: thingData,
    isPreviousData,
    isSuccess,
  } = useGetEntityThings({
    projectId,
    type: 'thing',
    config: { keepPreviousData: true },
  })

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:custom_protocol.thing.title')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            <CreateThing thingType="thing" />
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
    </div>
  )
}
