import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'

import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'
// import { UpdateDevice } from './UpdateDevice'
import { useDeleteThing } from '../../api/thingAPI'

import { type BaseTablePagination } from '~/types'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { UpdateThing } from './UpdateThing'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'
import { type EntityThing } from '~/cloud/customProtocol'

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
  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteThing()

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
                <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
              }
              onClick={open}
            >
              {t('cloud:custom_protocol.thing.edit')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:custom_protocol.thing.delete')}
              body={
                t('cloud:custom_protocol.thing.delete_thing_confirm').replace(
                  '{{THINGNAME}}',
                  name,
                ) ?? 'Confirm delete?'
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
                      alt="Delete thing"
                      className="h-5 w-5"
                    />
                  }
                >
                  {t('cloud:custom_protocol.thing.delete')}
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
        <UpdateThing
          thingId={id}
          name={name}
          description={description}
          close={close}
          isOpen={true}
        />
      ) : null}
    </>
  )
}

type ThingTableProps = {
  data: EntityThing[]
} & BaseTablePagination

export function ThingTable({ data, ...props }: ThingTableProps) {
  const { t } = useTranslation()
  const { id: projectId } = storage.getProject()

  const columnHelper = createColumnHelper<EntityThing>()
  const columns = useMemo<ColumnDef<EntityThing, any>[]>(
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
      columnHelper.display({
        id: 'name',
        header: () => <span>{t('cloud:custom_protocol.thing.name')}</span>,
        cell: info => {
          const nameThing = info.row.original.name
          const thingId = info.row.original.id
          return (
            <NavLink to={`${PATHS.THING_SERVICE}/${projectId}/${thingId}`} className="flex cursor-pointer gap-2">
              <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
                {nameThing}
              </p>
            </NavLink>
          )
        },
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
    [],
  )

  return data != null && data?.length !== 0 ? (
    <BaseTable data={data} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_thing')}
    </div>
  )
}
