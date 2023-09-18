import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { BaseTable } from '~/components/Table'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import { useDeleteEvent } from '../../api/eventAPI'
import storage from '~/utils/storage'

import { type EventType } from '../../types'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { UpdateEvent } from './UpdateEvent'
import { useTriggerEvent } from '../../api/eventAPI/triggerEvent'

function EventTableContextMenu({ id, name, dataRow }: { id: string; name: string, dataRow: EventType}) {
  const { t } = useTranslation()

  console.log(dataRow, 'dataRowwww')

  const { close, open, isOpen } = useDisclosure()

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useDeleteEvent()

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
        <Menu.Items className="absolute right-0 z-10 mt-6 w-32 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            <MenuItem
              icon={
                <img src={btnEditIcon} alt="Edit event" className="h-5 w-5" />
              }
              onClick={open}
            >
              {t('cloud:org_manage.event_manage.add_event.edit')}
            </MenuItem>
            <MenuItem
              icon={
                <img
                  src={btnCopyIdIcon}
                  alt="Copy event's ID"
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
              title={t('cloud:org_manage.event_manage.table.delete_event')}
              body={
                t(
                  'cloud:org_manage.event_manage.table.delete_event_confirm',
                ).replace('{{EVENTNAME}}', name) ?? 'Confirm delete?'
              }
              triggerButton={
                <Button
                  className="w-full border-none hover:text-primary-400"
                  style={{ justifyContent: 'flex-start' }}
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete event"
                      className="h-5 w-5"
                    />
                  }
                >
                  {t('cloud:org_manage.event_manage.table.delete_event')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() => mutate({ id, projectId })}
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
        <UpdateEvent eventId={id} name={name} close={close} isOpen={isOpen} />
      ) : null}
    </>
  )
}

export function EventTable({ data, ...props }: { data: EventType[] }) {
  const { t } = useTranslation()
  const { id: projectId } = storage.getProject()
  const { mutate, isLoading, isSuccess } = useTriggerEvent()

  const columnHelper = createColumnHelper<EventType>()
  const columns = useMemo<ColumnDef<EventType, any>[]>(
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
          <span>{t('cloud:org_manage.event_manage.table.name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('group_name', {
        header: () => (
          <span>{t('cloud:org_manage.event_manage.table.group')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'onClick',
        header: () => (
          <span>{t('cloud:org_manage.event_manage.table.onClick')}</span>
        ),
        cell: info => {
          const { id } = info.row.original
          return (
            <span
              className={`${
                info.row.original.onClick === 'true' && 'cursor-pointer'
              }`}
              onClick={() =>
                info.row.original.onClick === 'true'&& mutate({
                  data: {
                    event_id: id,
                    project_id: projectId,
                  },
                })
              }
            >
              {info.row.original.onClick}
            </span>
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'status',
        header: () => (
          <span>{t('cloud:org_manage.event_manage.table.status')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const dataRow = info.row.original
          const { name, id } = info.row.original
          return EventTableContextMenu({ name, id, dataRow })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return data != null && data?.length !== 0 ? (
    <BaseTable data={data} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_event')}
    </div>
  )
}
