import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { BaseTable } from '~/components/Table'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import { PATHS } from '~/routes/PATHS'
import { UpdateDevice } from './UpdateDevice'
import { getVNDateFormat } from '~/utils/misc'
import { useDeleteDevice } from '../../api/deviceAPI'
import storage from '~/utils/storage'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/Tooltip'

import { type Device } from '../../types'
import { type BaseTablePagination } from '~/types'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnDetailIcon from '~/assets/icons/btn-detail.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { UpdateIcon, CopyIcon } from '@radix-ui/react-icons'
import { UpdateVersionFirmWare } from './UpdateVersionFirmware'

function DeviceTableContextMenu({
  id,
  name,
  key,
  org_id,
  group,
  template_name,
  template_id,
  token,
}: {
  id: string
  name: string
  key: string
  org_id: string
  group: { label: string; value: string }
  template_name: string
  template_id: string
  token: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [type, setType] = useState('')

  const { close, open, isOpen } = useDisclosure()

  const { id: projectId } = storage.getProject()
  const { orgId } = useParams()

  const { mutate, isLoading, isSuccess } = useDeleteDevice()

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
        <Menu.Items className="divide-secondary-400 absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
            <MenuItem
              icon={
                <img
                  src={btnDetailIcon}
                  alt="View device"
                  className="h-5 w-5"
                />
              }
              onClick={() =>
                navigate(
                  `${PATHS.DEVICE_MANAGE}/${projectId}/${
                    orgId != null ? `${orgId}/${id}` : ` /${id}`
                  }`,
                )
              }
            >
              {t('table:view_detail')}
            </MenuItem>
            <MenuItem
              icon={
                <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
              }
              onClick={() => {
                open()
                setType('update-device')
              }}
            >
              {t('cloud:org_manage.device_manage.add_device.edit')}
            </MenuItem>
            <MenuItem
              icon={<UpdateIcon className="h-5 w-5" />}
              onClick={() => {
                open()
                setType('update-version')
              }}
            >
              {t('cloud:firmware.fota')}
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
              {t('table:copy_id')}
            </MenuItem>
            <MenuItem
              icon={<CopyIcon className="h-5 w-5" />}
              onClick={() => handleCopyId(token, 'token')}
            >
              {t('table:copy_token')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t(
                'cloud:org_manage.device_manage.table.delete_device_full',
              )}
              body={t(
                'cloud:org_manage.device_manage.table.delete_device_confirm',
              ).replace('{{DEVICENAME}}', name)}
              triggerButton={
                <Button
                  className="hover:text-primary-400 w-full justify-start border-none"
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
                  {t('cloud:org_manage.device_manage.table.delete_device')}
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
      {isOpen && type === 'update-device' ? (
        <UpdateDevice
          deviceId={id}
          org_id={org_id}
          name={name}
          keyDevice={key}
          group={group}
          close={close}
          isOpen={isOpen}
          template_name={template_name}
          template_id={template_id}
        />
      ) : null}
      {isOpen && type === 'update-version' ? (
        <UpdateVersionFirmWare deviceId={id} close={close} isOpen={isOpen} />
      ) : null}
    </>
  )
}

type DeviceTableProps = {
  data: Device[]
} & BaseTablePagination

export function DeviceTable({ data, ...props }: DeviceTableProps) {
  const { t } = useTranslation()

  const dataSorted = data?.sort((a, b) => b.created_time - a.created_time)

  let colsVisibility = {
    stt: true,
    name: true,
    group_name: true,
    status: true,
    attributes: false,
    created_by: false,
    group_id: false,
    token: false,
    org_id: false,
    template_id: false,
    device_type: true,
    key: true,
    created_at: true,
    contextMenu: true,
  }
  const columnHelper = createColumnHelper<Device>()
  const columns = useMemo<ColumnDef<Device, any>[]>(
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
          <span>{t('cloud:org_manage.device_manage.table.name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),

      columnHelper.accessor('group_name', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.group')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('status', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.status')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      // columnHelper.accessor('attributes', {
      //   header: () => (
      //     <span>{t('cloud:org_manage.device_manage.table.attributes')}</span>
      //   ),
      //   cell: info => info.getValue(),
      //   footer: info => info.column.id,
      // }),
      columnHelper.accessor('created_by', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.create_by')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('group_id', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.group_id')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('token', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.token')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('org_id', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.org_id')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('template_id', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.template_id')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),

      columnHelper.accessor('template_name', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.device_type')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      // columnHelper.display({
      //   id: 'orgName',
      //   header: () => (
      //     <span>{t('cloud:org_manage.device_manage.table.org_name')}</span>
      //   ),
      //   cell: info => info.row.original.org_name || t('table:no_in_org'),
      //   footer: info => info.column.id,
      // }),
      columnHelper.display({
        id: 'key',
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.key')}</span>
        ),
        cell: info => {
          const { key } = info.row.original
          const keyTrigger = key?.slice(0, 15) + '...'
          return (
            <>
              {key ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{keyTrigger}</TooltipTrigger>
                    <TooltipContent>
                      <p>{key}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                ''
              )}
            </>
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('created_time', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.created_at')}</span>
        ),
        cell: info =>
          getVNDateFormat({ date: parseInt(info.getValue()) * 1000 }), // convert seconds to milliseconds
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const {
            name,
            id,
            key,
            org_id,
            group_id,
            group_name,
            template_id,
            template_name,
            token,
          } = info.row.original
          const group = {
            label: group_name,
            value: group_id,
          }
          return DeviceTableContextMenu({
            name,
            id,
            key,
            org_id,
            group,
            template_name,
            template_id,
            token,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return data != null && data?.length !== 0 ? (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={dataSorted}
      columns={columns}
      colsVisibility={colsVisibility}
      {...props}
      className="overflow-x-auto "
    />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_device')}
    </div>
  )
}
