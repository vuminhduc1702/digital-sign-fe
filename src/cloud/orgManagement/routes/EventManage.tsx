import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useProjectIdStore } from '~/stores/project'
import { useGetEvents } from '../api/eventAPI'
import {
  ComboBoxSelectEvent,
  CreateEvent,
  EventTable,
} from '../components/Event'

import { type EventType } from '../types'

export function EventManage() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<EventType[]>(
    [],
  )
  const [offset, setOffset] = useState(0)

  const params = useParams()

  const orgId = params.orgId as string
  const projectId = useProjectIdStore(state => state.projectId)
  const {
    data: eventData,
    isPreviousData,
    isSuccess,
  } = useGetEvents({
    orgId,
    projectId,
    config: { keepPreviousData: true },
  })
  console.log('eventData', eventData?.events)

  return (
    <>
      <TitleBar
        title={t('cloud:org_manage.event_manage.header') ?? 'Event management'}
      />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable />
          <div className="flex items-center gap-x-3">
            <CreateEvent />
            {isSuccess ? (
              <ComboBoxSelectEvent
                data={eventData}
                setFilteredComboboxData={setFilteredComboboxData}
                offset={offset}
              />
            ) : null}
          </div>
        </div>
        <EventTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={eventData?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
