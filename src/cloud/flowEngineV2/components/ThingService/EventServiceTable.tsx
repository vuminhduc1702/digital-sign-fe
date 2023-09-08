import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'
import { useDeleteThingService } from '../../api/thingServiceAPI'

import { type BaseTablePagination } from '~/types'
import { type BodyEventService, type EventService } from '../../types'

import { useParams } from 'react-router-dom'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { getVNDateFormat } from '~/utils/misc'
import { ViewInputOutput } from './ViewInputOutput'

function EventServiceTableContextMenu({
  body,
  type,
  ...props
}: {
  body: BodyEventService
  type: string
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteThingService()

  return (
    <>
      <BtnContextMenuIcon
        height={20}
        width={10}
        onClick={open}
        viewBox="0 0 1 20"
        className="cursor-pointer text-secondary-700 hover:text-primary-400"
      />
      {isOpen ? (
        <ViewInputOutput
          type={type}
          body={body}
          close={close}
          isOpen={isOpen}
          {...props}
        />
      ) : null}
    </>
  )
}

type EventServiceTableProps = {
  data: EventService[]
} & BaseTablePagination

export function EventServiceTable({ data, ...props }: EventServiceTableProps) {
  const { t } = useTranslation()
  const params = useParams()
  const thingId = params.thingId as string

  const columnHelper = createColumnHelper<EventService>()
  const columns = useMemo<ColumnDef<EventService, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          const orderId = parseInt(info.row.id) + 1
          return orderId
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('ts', {
        header: () => <span>{t('cloud:custom_protocol.service.time')}</span>,
        cell: info =>
          getVNDateFormat({ date: parseInt(info.getValue()) * 1000 }),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'inputMenu',
        cell: info => {
          const { body } = info.row.original
          return EventServiceTableContextMenu({
            body,
            type: 'input',
          })
        },
        header: () => <span>{t('cloud:custom_protocol.service.input')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'outputMenu',
        cell: info => {
          const { body } = info.row.original
          return EventServiceTableContextMenu({
            body,
            type: 'output',
          })
        },
        header: () => <span>{t('cloud:custom_protocol.service.output')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('status', {
        header: () => <span>{t('cloud:custom_protocol.service.status')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return data != null && data?.length !== 0 ? (
    <BaseTable data={data} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_event_service')}
    </div>
  )
}
