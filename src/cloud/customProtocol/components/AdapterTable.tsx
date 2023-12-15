import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { BaseTable } from '~/components/Table'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import { useDeleteAdapter } from '../api/adapter'
import { UpdateAdapter } from './UpdateAdapter'

import { type BaseTablePagination } from '~/types'
import { type Adapter } from '../types'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export type AdapterTableContextMenuProps = Omit<
  Adapter,
  'owner' | 'project_id' | 'created_time' | 'topic'
> & { configuration: string }

function AdapterTableContextMenu({
  id,
  name,
  content_type,
  protocol,
  thing_id,
  handle_service,
  host,
  port,
  configuration,
  schema,
}: AdapterTableContextMenuProps) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteAdapter()

  const handleCopyId = useCopyId()

  return (
    <>
      <Dropdown
        icon={
          <BtnContextMenuIcon
            height={20}
            width={10}
            viewBox="0 0 1 20"
            className="text-secondary-700 hover:text-primary-400"
          />
        }
      >
        <Menu.Items className="absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
            <MenuItem
              icon={
                <img src={btnEditIcon} alt="Edit adapter" className="h-5 w-5" />
              }
              onClick={open}
            >
              {t('cloud:custom_protocol.adapter.table.edit')}
            </MenuItem>
            <MenuItem
              icon={
                <img
                  src={btnCopyIdIcon}
                  alt="Copy adapter's ID"
                  className="h-5 w-5"
                />
              }
              onClick={() => handleCopyId(id)}
            >
              {t('table:copy_id')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:custom_protocol.adapter.table.delete_adapter')}
              body={t(
                'cloud:custom_protocol.adapter.table.delete_adapter_confirm',
              ).replace('{{ADAPTERNAME}}', name)}
              triggerButton={
                <Button
                  className="w-full justify-start border-none hover:text-primary-400"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete adapter"
                      className="h-5 w-5"
                    />
                  }
                >
                  {t('cloud:custom_protocol.adapter.table.delete_adapter')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() => mutate({ id })}
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
      {isOpen ? (
        <UpdateAdapter
          id={id}
          name={name}
          content_type={content_type}
          protocol={protocol}
          thing_id={thing_id}
          handle_service={handle_service}
          host={host}
          port={port}
          configuration={configuration}
          close={close}
          isOpen={isOpen}
          schema={schema}
        />
      ) : null}
    </>
  )
}

type AdapterTableProps = {
  data: Adapter[]
} & BaseTablePagination

export function AdapterTable({
  data,
  offset,
  setOffset,
  total,
  isPreviousData,
  ...props
}: AdapterTableProps) {
  const { t } = useTranslation()

  const dataSorted = data?.sort((a, b) => b.created_time - a.created_time)

  const columnHelper = createColumnHelper<Adapter>()
  const columns = useMemo<ColumnDef<Adapter, any>[]>(
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
      columnHelper.accessor('name', {
        header: () => (
          <span>{t('cloud:custom_protocol.adapter.table.name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('protocol', {
        header: () => (
          <span>{t('cloud:custom_protocol.adapter.table.protocol')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('thing_id', {
        header: () => (
          <span>{t('cloud:custom_protocol.adapter.table.thing_id')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('handle_service', {
        header: () => (
          <span>{t('cloud:custom_protocol.adapter.table.handle_service')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('host', {
        header: () => (
          <span>{t('cloud:custom_protocol.adapter.table.host')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('port', {
        header: () => (
          <span>{t('cloud:custom_protocol.adapter.table.port')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const {
            id,
            name,
            content_type,
            protocol,
            thing_id,
            handle_service,
            host,
            port,
            configuration,
            schema,
          } = info.row.original
          return AdapterTableContextMenu({
            id,
            name,
            content_type,
            protocol,
            thing_id,
            handle_service,
            host,
            port,
            configuration,
            schema,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={dataSorted}
      columns={columns}
      onDataText={t('table:no_adapter')}
      {...props}
    />
  )
}
