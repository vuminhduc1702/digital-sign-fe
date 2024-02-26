import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { useGetEvents } from '../api/eventAPI'
import { CreateEvent, EventTable } from '../components/Event'
import { useDeleteMultipleEvents } from '../api/eventAPI/deleteMultipleEvents'

export function EventManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

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
    eventData?.events?.reduce((acc, curr, index) => {
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
                    <div>{t('btn:delete')}:</div>
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
                        className="size-5"
                      />
                    }
                  />
                }
              />
            )}
            <CreateEvent />
            {/* dummyInput */}
          </div>
        </div>
        <EventTable
          data={eventData?.events ?? []}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  )
}
