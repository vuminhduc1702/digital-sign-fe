import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Link } from '~/components/Link'
import { BaseTable } from '~/components/Table'
import { PATHS } from '~/routes/PATHS'
import { useDisclosure } from '~/utils/hooks'
import storage from '~/utils/storage'
import { useDeleteThing } from '../../api/thingAPI'
import { UpdateThing } from './UpdateThing'

import { type EntityThing } from '~/cloud/customProtocol'
import { type BaseTablePagination } from '~/types'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/Dropdowns'
import { BtnContextMenuIcon } from '~/components/SVGIcons'

function ThingTableContextMenu({
  id,
  name,
  description,
}: {
  id: string
  name: string
  description: string
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()
  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteThing()

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
          <DropdownMenuItem onClick={open}>
            <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
            {t('cloud:custom_protocol.thing.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openDelete}>
            <img src={btnDeleteIcon} alt="Delete thing" className="h-5 w-5" />
            {t('cloud:custom_protocol.thing.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isOpen ? (
        <UpdateThing
          thingId={id}
          name={name}
          description={description}
          close={close}
          isOpen={isOpen}
        />
      ) : null}

      {isOpenDelete ? (
        <ConfirmDialog
          title={t('cloud:custom_protocol.thing.delete')}
          body={t('cloud:custom_protocol.thing.delete_thing_confirm').replace(
            '{{THINGNAME}}',
            name,
          )}
          icon="danger"
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() => mutate({ id })}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}

type ThingTableProps = {
  data: EntityThing[]
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
} & BaseTablePagination
export function ThingTable({ data, ...props }: ThingTableProps) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id

  const columnHelper = createColumnHelper<EntityThing>()
  const columns = useMemo<ColumnDef<EntityThing, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1 + props.offset,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'name',
        header: () => <span>{t('cloud:custom_protocol.thing.name')}</span>,
        cell: info => info.row.original.name,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('template_name', {
        header: () => (
          <span>{t('cloud:custom_protocol.thing.template_name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('total_service', {
        header: () => (
          <span>{t('cloud:custom_protocol.thing.number_thing')}</span>
        ),
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
          const { name, id, description } = info.row.original
          return ThingTableContextMenu({ name, id, description })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [props.offset],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={data}
      columns={columns}
      onDataText={t('table:no_thing')}
      path={PATHS.THING_TEMPLATE}
      projectId={projectId}
      {...props}
    />
  )
}
