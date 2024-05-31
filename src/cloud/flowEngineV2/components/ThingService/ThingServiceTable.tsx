import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseTable } from '@/components/Table'
import { useDisclosure } from '@/utils/hooks'
import { useDeleteThingService } from '../../api/thingServiceAPI'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { type BaseTableProps } from '@/components/Table'
import { LuPen, LuTrash2 } from 'react-icons/lu'
import { useParams } from 'react-router-dom'
import { type ThingService } from '../../types'
import { UpdateThingService } from './UpdateThingService'

function ThingServiceTableContextMenu({
  thingId,
  name,
  description,
  data,
  ...props
}: {
  thingId: string
  name: string
  description: string
  data: ThingService[]
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()
  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteThingService()

  return (
    <>
      <div className="flex">
        <div className="flex cursor-pointer justify-center p-3">
          <LuPen
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={open}
          />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <LuTrash2
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={openDelete}
          />
        </div>
      </div>
      <UpdateThingService
        name={name}
        description={description}
        close={close}
        isOpen={isOpen}
        thingServiceDataProps={data}
        {...props}
      />
      <ConfirmDialog
        icon="danger"
        title={t('cloud:custom_protocol.service.delete')}
        body={t('cloud:custom_protocol.service.delete_service_confirm').replace(
          '{{SERVICENAME}}',
          name,
        )}
        close={closeDelete}
        isOpen={isOpenDelete}
        isSuccessDelete={isSuccess}
        handleSubmit={() => {
          mutate({ thingId, name })
        }}
        isLoading={isLoading}
      />
    </>
  )
}

type PartialBaseTableProps<T> = Omit<
  BaseTableProps<ThingService>,
  'columns'
> & {
  columns?: ColumnDef<T, any>[]
}

type ThingServiceTableProps = {
  data: ThingService[]
} & PartialBaseTableProps<ThingService>

export function ThingServiceTable({ data, ...props }: ThingServiceTableProps) {
  const { t } = useTranslation()
  const params = useParams()
  const thingId = params.thingId as string

  const offsetPrev = useRef<number>(props.offset)

  useEffect(() => {
    if (props.isPreviousData && offsetPrev.current < props.offset) {
      offsetPrev.current = props.offset
    }
  }, [props.isPreviousData])

  const columnHelper = createColumnHelper<ThingService>()
  const columns = useMemo<ColumnDef<ThingService, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          return !props.isPreviousData
            ? info.row.index + 1 + props.offset
            : info.row.index + 1 + offsetPrev.current
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('name', {
        header: () => <span>{t('cloud:custom_protocol.service.name')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('description', {
        header: () => (
          <span>{t('cloud:custom_protocol.thing.description')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { name, description } = info.row.original
          return ThingServiceTableContextMenu({
            thingId,
            name,
            description,
            data,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [props.offset],
  )

  return (
    <BaseTable
      data={data}
      columns={columns}
      onDataText={t('table:no_service')}
      isCheckbox={false}
      {...props}
    />
  )
}
