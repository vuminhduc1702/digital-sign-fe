import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/Button'

import { BaseTable } from '@/components/Table'
import { useDisclosure } from '@/utils/hooks'
import { useDeleteThingService } from '../../api/thingServiceAPI'

import { type BaseTablePagination } from '@/types'
import { type ThingService } from '../../types'
import { type BaseTableProps } from '@/components/Table'
import { useParams } from 'react-router-dom'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnEditIcon from '@/assets/icons/btn-edit.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '@/components/SVGIcons'
import { UpdateThingService } from './UpdateThingService'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/Dropdowns'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { LuEye, LuPen, LuTrash2, LuMoreVertical, LuFiles } from 'react-icons/lu'

function ThingServiceTableContextMenu({
  thingId,
  name,
  description,
  data,
  ...props
}: {
  thingId?: string
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
        {/* <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center justify-center rounded-md text-body-sm text-white hover:bg-opacity-30 hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
              <BtnContextMenuIcon
                height={20}
                width={10}
                viewBox="0 0 1 20"
                className="text-secondary-700 hover:text-primary-400"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                open()
              }}
            >
              <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
              {t('cloud:custom_protocol.service.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDelete}>
              <img
                src={btnDeleteIcon}
                alt="Delete service"
                className="h-5 w-5"
              />
              {t('cloud:custom_protocol.service.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      {isOpen ? (
        <UpdateThingService
          name={name}
          close={close}
          isOpen={isOpen}
          thingServiceDataProps={data}
          {...props}
        />
      ) : null}

      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:custom_protocol.service.delete')}
          body={t(
            'cloud:custom_protocol.service.delete_service_confirm',
          ).replace('{{SERVICENAME}}', name)}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() => mutate({ thingId, name })}
          isLoading={isLoading}
        />
      ) : null}
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
    ],
    [data, props.offset],
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
