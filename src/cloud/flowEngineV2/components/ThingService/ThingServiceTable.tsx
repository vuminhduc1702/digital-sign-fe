import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'
import { useDeleteThingService } from '../../api/thingServiceAPI'

import { type BaseTablePagination } from '~/types'
import { type ThingService } from '../../types'

import { useParams } from 'react-router-dom'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { UpdateThingService } from './UpdateThingService'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/Dropdowns'
import { ConfirmDialog } from '~/components/ConfirmDialog'

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
      <DropdownMenu>
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
            }}>
            <img src={btnEditIcon} alt="Edit device" className="size-5" />
            {t('cloud:custom_protocol.service.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={openDelete}>
            <img src={btnDeleteIcon} alt="Delete service" className="size-5" />
            {t('cloud:custom_protocol.service.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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

type ThingServiceTableProps = {
  data: ThingService[]
} & BaseTablePagination

export function ThingServiceTable({ data, ...props }: ThingServiceTableProps) {
  const { t } = useTranslation()
  const params = useParams()
  const thingId = params.thingId as string

  const columnHelper = createColumnHelper<ThingService>()
  const columns = useMemo<ColumnDef<ThingService, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1 + props.offset,
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
        cell: info => (info.getValue() === 'null' ? '' : info.getValue()),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { name, description } = info.row.original
          return ThingServiceTableContextMenu({
            name,
            description,
            thingId,
            data,
          })
        },
        header: () => null,
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
      {...props}
    />
  )
}
