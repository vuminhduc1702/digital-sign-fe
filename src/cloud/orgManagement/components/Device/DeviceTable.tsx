import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { BaseTable } from '~/components/Table'
import { type EntityType } from '~/cloud/orgManagement/api/attrAPI'
import { useDisclosure } from '~/utils/hooks'

import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import {
  type PropertyValuePair,
  getVNDateFormat,
  useCopyId,
} from '~/utils/misc'
import { useDeleteDevice, useGetDevice } from '../../api/deviceAPI'
import { useOrgIdStore } from '~/stores/org'
import { useProjectIdStore } from '~/stores/project'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { UpdateDevice } from './UpdateDevice'

function DeviceTableContextMenu({ id, name }: { id: string; name: string }) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteDevice()

  const handleCopyId = useCopyId()

  return (
    <>
      <Dropdown
        icon={
          <BtnContextMenuIcon
            height={20}
            width={3}
            viewBox="0 0 3 20"
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
              {t('cloud.org_manage.org_map.edit')}
            </MenuItem>
            <MenuItem
              icon={
                <img
                  src={btnCopyIdIcon}
                  alt="Copy device's ID"
                  className="h-5 w-5"
                />
              }
              onClick={() => handleCopyId(id)}
            >
              {t('cloud.org_manage.org_map.copy_id')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t(
                'cloud.org_manage.device_manage.table.delete_device_full',
              )}
              body={
                t(
                  'cloud.org_manage.device_manage.table.delete_device_confirm',
                ).replace('{{DEVICENAME}}', name) ?? 'Confirm delete?'
              }
              triggerButton={
                <Button
                  className="w-full border-none hover:opacity-100"
                  style={{ justifyContent: 'flex-start' }}
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete device"
                      className="h-5 w-5"
                    />
                  }
                >
                  {t('cloud.org_manage.device_manage.table.delete_device')}
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
        <UpdateDevice attributeKey={name} close={close} isOpen={isOpen} />
      ) : null}
    </>
  )
}

export function DeviceTable({
  data,
  entityId,
  entityType,
  ...props
}: {
  data: PropertyValuePair<string>[]
  entityId: string
  entityType: EntityType
}) {
  const { t } = useTranslation()

  const orgId = useOrgIdStore(state => state.orgId)
  const projectId = useProjectIdStore(state => state.projectId)
  const { data: deviceData } = useGetDevice({ orgId, projectId })

  const dataSorted = deviceData?.devices.sort(
    (a, b) => a.created_time - b.created_time,
  )

  const columnHelper = createColumnHelper<PropertyValuePair<string>>()
  const columns = useMemo<ColumnDef<PropertyValuePair<string>, string>[]>(
    () => [
      columnHelper.accessor('stt', {
        cell: info => {
          const orderId = parseInt(info.row.id) + 1
          return orderId
        },
        header: () => <span>{t('table.no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('name', {
        header: () => (
          <span>{t('cloud.org_manage.device_manage.table.name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('group_name', {
        header: () => (
          <span>{t('cloud.org_manage.device_manage.table.group')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('template_name', {
        header: () => (
          <span>{t('cloud.org_manage.device_manage.table.device_type')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('created_time', {
        header: () => (
          <span>{t('cloud.org_manage.device_manage.table.created_at')}</span>
        ),
        cell: info => getVNDateFormat(parseInt(info.getValue()) * 1000), // convert seconds to milliseconds
        footer: info => info.column.id,
      }),
      columnHelper.accessor('contextMenu', {
        cell: info => {
          const { name, id } = info.row.original
          return DeviceTableContextMenu({ name, id })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return <BaseTable data={dataSorted} columns={columns} {...props} />
}
