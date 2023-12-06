import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useGetEvents } from '../api/eventAPI'
import {
  ComboBoxSelectEvent,
  CreateEvent,
  EventTable,
} from '../components/Event'
import storage from '~/utils/storage'

import { type EventType } from '../types'

export function EventManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [filteredComboboxData, setFilteredComboboxData] = useState<EventType[]>(
    [],
  )

  const params = useParams()

  const orgId = params.orgId as string
  const projectId = storage.getProject()?.id
  const {
    data: eventData,
    isPreviousData,
    isSuccess,
  } = useGetEvents({
    orgId,
    projectId,
    config: { keepPreviousData: true },
  })

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:org_manage.event_manage.header')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable refComponent={ref} />
          <div className="flex items-center gap-x-3">
            <CreateEvent />
            {isSuccess ? (
              <ComboBoxSelectEvent
                data={eventData}
                setFilteredComboboxData={setFilteredComboboxData}
              />
            ) : null}
          </div>
        </div>
        <EventTable data={filteredComboboxData} />
      </div>
    </div>
  )
}
