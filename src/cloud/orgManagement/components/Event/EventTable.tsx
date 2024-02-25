import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import storage from '~/utils/storage'
import { useDeleteEvent } from '../../api/eventAPI'
import { useTriggerEvent } from '../../api/eventAPI/triggerEvent'
import { UpdateEvent } from './UpdateEvent'
import i18n from '~/i18n'

import { type Action, type Condition, type EventType } from '../../types'

import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'

export const initialTodos = [
  {
    id: '1',
    name: i18n.t('cloud:org_manage.event_manage.add_event.interval.mon'),
    selected: false,
    value: 'monday',
  },
  {
    id: '2',
    name: i18n.t('cloud:org_manage.event_manage.add_event.interval.tue'),
    selected: false,
    value: 'tuesday',
  },
  {
    id: '3',
    name: i18n.t('cloud:org_manage.event_manage.add_event.interval.wed'),
    selected: false,
    value: 'wednesday',
  },
  {
    id: '4',
    name: i18n.t('cloud:org_manage.event_manage.add_event.interval.thu'),
    selected: false,
    value: 'thursday',
  },
  {
    id: '5',
    name: i18n.t('cloud:org_manage.event_manage.add_event.interval.fri'),
    selected: false,
    value: 'friday',
  },
  {
    id: '6',
    name: i18n.t('cloud:org_manage.event_manage.add_event.interval.sat'),
    selected: false,
    value: 'saturday',
  },
  {
    id: '7',
    name: i18n.t('cloud:org_manage.event_manage.add_event.interval.sun'),
    selected: false,
    value: 'sunday',
  },
]

function EventTableContextMenu({
  id,
  name,
  dataRow,
}: {
  id: string
  name: string
  dataRow: EventType
}) {
  const { t } = useTranslation()
  const [dataAction, setDataAction] = useState<Action[]>([])
  const [conditionData, setConditionData] = useState<Condition[] | null>([])
  const [startTime, setStartTime] = useState<string>()
  const [endTime, setEndTime] = useState<string>()
  const [typeEvent, setTypeEvent] = useState<string>('')
  const [todos, setTodos] = useState(initialTodos)

  useEffect(() => {
    setDataAction(dataRow?.action)
    setConditionData(dataRow?.condition)
    const myArray = dataRow?.schedule?.repeat?.split(',')
    if (Array.isArray(myArray)) {
      setTypeEvent('schedule')
      const newArr = todos.map(item => {
        if (myArray?.includes(item.value)) {
          return { ...item, selected: true }
        } else return { ...item, selected: false }
      })
      setTodos(newArr)
      setStartTime(dataRow?.schedule?.time)
    } else {
      setTypeEvent('event')
      const newInterval = todos.map(item => {
        if (dataRow?.interval?.[item.value]) {
          return { ...item, selected: true }
        } else return { ...item, selected: false }
      })
      setTodos(newInterval)
      setStartTime(dataRow?.interval?.start_time)
      setEndTime(dataRow?.interval?.end_time)
    }
  }, [id, dataRow])

  const { close, open, isOpen } = useDisclosure()

  const projectId = storage.getProject()?.id

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
        <Menu.Items className="absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
            <MenuItem
              icon={
                <img src={btnEditIcon} alt="Edit event" className="size-5" />
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
                  className="size-5"
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
              body={t(
                'cloud:org_manage.event_manage.table.delete_event_confirm',
              ).replace('{{EVENTNAME}}', name)}
              triggerButton={
                <Button
                  className="w-full justify-start border-none hover:text-primary-400"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete event"
                      className="size-5"
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
                    <img src={btnSubmitIcon} alt="Submit" className="size-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
      {isOpen ? (
        <UpdateEvent
          data={dataRow}
          dateArr={todos}
          dataAction={dataAction}
          conditionData={conditionData}
          type={typeEvent}
          eventId={id}
          name={name}
          close={close}
          isOpen={isOpen}
          startTimeProps={startTime}
          endTimeProps={endTime}
        />
      ) : null}
    </>
  )
}

export function EventTable({
  data,
  ...props
}: {
  data: EventType[]
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
}) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const { mutate, isLoading, isSuccess } = useTriggerEvent()

  const columnHelper = createColumnHelper<EventType>()
  const columns = useMemo<ColumnDef<EventType, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1,
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
              className={`${info.row.original.onClick && 'cursor-pointer'}`}
              onClick={() =>
                info.row.original.onClick &&
                mutate({
                  data: {
                    event_id: id,
                    project_id: projectId,
                  },
                })
              }
            >
              {info.row.original.onClick && (
                <Button
                  className="w-30 justify-start rounded-md border-none"
                  variant="secondaryLight"
                  size="square"
                >
                  {t('cloud:org_manage.event_manage.table.onClick_btn')}
                </Button>
              )}
            </span>
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('status', {
        header: () => (
          <span>{t('cloud:org_manage.event_manage.table.status')}</span>
        ),
        cell: info => info.getValue().toString(),
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

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={data}
      columns={columns}
      onDataText={t('table:no_event')}
      {...props}
    />
  )
}
