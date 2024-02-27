import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useGetEvents } from '../api/eventAPI'
import {
  CreateEvent,
  EventTable,
} from '../components/Event'
import storage from '~/utils/storage'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { type EventType } from '../types'
import { useDeleteMultipleEvents } from '../api/eventAPI/deleteMultipleEvents'
import { Button } from '~/components/Button'
import { flattenData } from '~/utils/misc'
import { InputField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { XMarkIcon } from '@heroicons/react/20/solid'

export function EventManage() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')

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

  // flatten the data
  const { acc: eventFlattenData } = flattenData(eventData?.events, [
    'id',
    'name',
    'group_name',
    'onClick',
    'status',
    'interval',
    'retry',
    'schedule',
    'action',
    'condition',
    'org_id',
    'group_id',
    // 'cmd',
  ])

  const {
    mutate: mutateDeleteMultipleEvents,
    isLoading,
    isSuccess: isSuccessDeleteMultipleEvents,
  } = useDeleteMultipleEvents()
  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.org_manage.overview.name'),
      t('cloud:org_manage.group_manage.title'),
      'onClick',
      t('billing:manage_bill.table.status'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const aoo: Array<{ [key: string]: string }> | undefined =
    eventFlattenData.reduce((acc, curr, index) => {
      if (rowSelectionKey.includes(curr.id)) {
        const temp = {
          [t('table:no')]: (index + 1).toString(),
          [t('cloud:org_manage.org_manage.overview.name')]: curr.name,
          [t('cloud:org_manage.group_manage.title')]: curr.group_name,
          onClick: curr.onClick,
          [t('billing:manage_bill.table.status')]: curr.status,
        }
        acc.push(temp)
      }
      return acc
    }, [] as Array<{ [key: string]: string }>)

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:org_manage.event_manage.header')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable
            refComponent={ref}
            rowSelection={rowSelection}
            aoo={aoo}
            pdfHeader={pdfHeader}
          />
          <div className="flex items-center gap-x-3">
            {Object.keys(rowSelection).length > 0 && (
              <ConfirmationDialog
                isDone={isSuccessDeleteMultipleEvents}
                icon="danger"
                title={t('cloud:org_manage.event_manage.table.delete_event')}
                body={t(
                  'cloud:org_manage.event_manage.table.delete_multiple_event_confirm',
                )}
                triggerButton={
                  <div className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white">
                    <div>Xoá:</div>
                    <div>{Object.keys(rowSelection).length}</div>
                  </div>
                }
                confirmButton={
                  <Button
                    isLoading={isLoading}
                    type="button"
                    size="md"
                    className="bg-primary-400"
                    onClick={() =>
                      mutateDeleteMultipleEvents(
                        {
                          data: { ids: rowSelectionKey },
                        },
                        { onSuccess: () => setRowSelection({}) },
                      )
                    }
                    startIcon={
                      <img
                        src={btnSubmitIcon}
                        alt="Submit"
                        className="h-5 w-5"
                      />
                    }
                  />
                }
              />
            )}
            <CreateEvent />
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
        <EventTable
          data={eventFlattenData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  )
}
