import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { useGetEvents } from '../api/eventAPI'
import { CreateEvent, EventTable } from '../components/Event'
import { useDeleteMultipleEvents } from '../api/eventAPI/deleteMultipleEvents'
import { SearchField } from '~/components/Input'
import { useDisclosure } from '~/utils/hooks'
import { ConfirmDialog } from '~/components/ConfirmDialog'

export function EventManage() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()
  const [isSearchData, setIsSearchData] = useState<boolean>(false)

  const params = useParams()
  const orgId = params.orgId as string
  const projectId = storage.getProject()?.id
  const {
    data: eventData,
    isPreviousData: isPreviousDataEvent,
    isLoading: isLoadingEvent,
  } = useGetEvents({
    orgId,
    projectId,
    config: { keepPreviousData: true },
  })

  const {
    mutate: mutateDeleteMultipleEvents,
    isLoading,
    isSuccess: isSuccessDeleteMultipleEvents,
  } = useDeleteMultipleEvents()

  useEffect(() => {
    if (isSuccessDeleteMultipleEvents) {
      closeDeleteMulti()
    }
  }, [isSuccessDeleteMultipleEvents])

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
  const formatExcel: Array<{ [key: string]: unknown }> | undefined =
    eventData?.events?.reduce(
      (acc, curr, index) => {
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
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:org_manage.event_manage.header')} />
      <div className="relative flex grow flex-col gap-10 px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <div className="flex w-full items-center justify-between gap-x-3">
            <SearchField
              setSearchValue={setSearchQuery}
              setIsSearchData={setIsSearchData}
              closeSearch={true}
            />
            <CreateEvent />
          </div>
        </div>
        <EventTable
          data={eventData?.events ?? []}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          isPreviousData={isPreviousDataEvent}
          isLoading={isLoadingEvent}
          pdfHeader={pdfHeader}
          formatExcel={formatExcel}
          isSearchData={searchQuery.length > 0 && isSearchData}
          utilityButton={
            Object.keys(rowSelection).length > 0 && (
              <div className="flex items-center">
                <Button
                  size="sm"
                  onClick={openDeleteMulti}
                  className="h-full min-w-[60px] rounded-none border-none hover:opacity-80"
                >
                  <div>{t('btn:delete')}:</div>
                  <div>{Object.keys(rowSelection).length}</div>
                </Button>
              </div>
            )
          }
        />
      </div>
      {isOpenDeleteMulti ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.event_manage.table.delete_event')}
          body={t(
            'cloud:org_manage.event_manage.table.delete_multiple_event_confirm',
          )}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
          handleSubmit={() =>
            mutateDeleteMultipleEvents(
              {
                data: { ids: rowSelectionKey },
              },
              { onSuccess: () => setRowSelection({}) },
            )
          }
          isLoading={isLoading}
        />
      ) : null}
    </div>
  )
}
