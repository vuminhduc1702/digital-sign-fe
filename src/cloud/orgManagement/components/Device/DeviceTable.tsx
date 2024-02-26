import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  type ColumnDef,
  createColumnHelper,
  filterFns,
} from '@tanstack/react-table'

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

import { type DeviceAdditionalInfo, type Device } from '../../types'
import { type BaseTablePagination } from '~/types'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnDetailIcon from '~/assets/icons/btn-detail.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { UpdateIcon, CopyIcon } from '@radix-ui/react-icons'
import { UpdateVersionFirmWare } from './UpdateVersionFirmware'
import { useBlockAndActiveDevice } from '../../api/deviceAPI/blockAndActiveDevice'
import { UpdateMqttConfig } from './UpdateMqttConfig'

function DeviceTableContextMenu({
  id,
  name,
  key,
  org_id,
  group_id,
  template_id,
  token,
  status,
  additional_info,
}: {
  id: string
  name: string
  key: string
  org_id: string
  group_id: string
  template_id: string
  token: string
  status: string
  additional_info: DeviceAdditionalInfo
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [type, setType] = useState('')

  const { close, open, isOpen } = useDisclosure()

  const projectId = storage.getProject()?.id
  const { orgId } = useParams()

  const { mutate, isLoading, isSuccess } = useDeleteDevice()

  const { mutate: mutateBlockAndActive } = useBlockAndActiveDevice()

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
                <img src={btnDetailIcon} alt="View device" className="size-5" />
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
                <img src={btnEditIcon} alt="Edit device" className="size-5" />
              }
              onClick={() => {
                open()
                setType('update-device')
              }}
            >
              {t('cloud:org_manage.device_manage.add_device.edit')}
            </MenuItem>
            <MenuItem
              icon={
                <img
                  src={btnEditIcon}
                  alt="Edit mqtt config"
                  className="size-5"
                />
              }
              onClick={() => {
                open()
                setType('update-mqtt')
              }}
            >
              {t('cloud:org_manage.device_manage.add_device.mqttconfig')}
            </MenuItem>
            <MenuItem
              icon={
                <img src={btnEditIcon} alt="Edit device" className="size-5" />
              }
              onClick={() => {
                let type = 'active'
                if (status === 'online' || status === 'offline') {
                  type = 'block'
                }
                mutateBlockAndActive({ type, deviceId: id })
              }}
            >
              {status === 'online' || status === 'offline'
                ? t('device:block')
                : t('device:active')}
            </MenuItem>
            <MenuItem
              icon={<UpdateIcon className="size-5" />}
              onClick={() => {
                if (status !== 'blocked') {
                  open()
                  setType('update-version')
                }
              }}
              style={{
                color: status === 'blocked' ? 'gray' : '',
                cursor: status === 'blocked' ? 'not-allowed' : 'pointer',
              }}
            >
              {t('cloud:firmware.fota')}
            </MenuItem>
            <MenuItem
              icon={
                <img
                  src={btnCopyIdIcon}
                  alt="Copy device's ID"
                  className="size-5"
                />
              }
              onClick={() => handleCopyId(id)}
            >
              {t('table:copy_id')}
            </MenuItem>
            <MenuItem
              icon={<CopyIcon className="size-5" />}
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
                  className="w-full justify-start border-none hover:text-primary-400"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete device"
                      className="size-5"
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
                    <img src={btnSubmitIcon} alt="Submit" className="size-5" />
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
          group_id={group_id}
          close={close}
          isOpen={isOpen}
          template_id={template_id}
          additional_info={additional_info}
        />
      ) : null}
      {isOpen && type === 'update-version' ? (
        <UpdateVersionFirmWare deviceId={id} close={close} isOpen={isOpen} />
      ) : null}
      {isOpen && additional_info != null && type === 'update-mqtt' ? (
        <UpdateMqttConfig
          additional_info={additional_info}
          deviceId={id}
          close={close}
          isOpen={isOpen}
        />
      ) : null}
    </>
  )
}

type DeviceTableProps = {
  data: Device[]
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
} & BaseTablePagination

export function DeviceTable({ data, ...props }: DeviceTableProps) {
  const { t } = useTranslation()

  const dataSorted = data?.sort((a, b) => b.created_time - a.created_time)

  const colsVisibility = {
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
    heartbeat: false,
    isdn: false,
  }
  const columnHelper = createColumnHelper<Device>()

  const columns = useMemo<ColumnDef<Device, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1 + props.offset,
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
      columnHelper.display({
        id: 'isdn',
        cell: info => {
          const isdn = info.row.original.additional_info.isdn
          const isdnTrigger =
            isdn?.length > 10 ? isdn.slice(0, 10) + '...' : isdn
          return (
            <>
              {isdn ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{isdnTrigger}</TooltipTrigger>
                    <TooltipContent>
                      <p>{isdn}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                ''
              )}
            </>
          )
        },
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.isdn')}</span>
        ),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'heartbeat',
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.heartbeat')}</span>
        ),
        cell: info => {
          const additionalInfo = info.row.original.additional_info
          return additionalInfo?.heartbeat_interval != null ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {'Interval: ' + additionalInfo.heartbeat_interval}
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {'Last heartbeat: ' +
                      getVNDateFormat({
                        date: (additionalInfo?.last_heartbeat || 0) * 1000,
                      })}
                  </p>
                  <p>{'Interval: ' + additionalInfo.heartbeat_interval}</p>
                  <p>{'Lifecycle: ' + additionalInfo.timeout_lifecycle}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('created_by', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.create_by')}</span>
        ),
        cell: info => {
          const created_by = info.getValue()
          const createdByTrigger =
            created_by?.length > 10
              ? created_by.slice(0, 10) + '...'
              : created_by
          return (
            <>
              {created_by ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{createdByTrigger}</TooltipTrigger>
                    <TooltipContent>
                      <p>{created_by}</p>
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
      columnHelper.accessor('group_id', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.group_id')}</span>
        ),
        cell: info => {
          const group_id = info.getValue()
          const groupIdTrigger =
            group_id?.length > 10 ? group_id.slice(0, 10) + '...' : group_id
          return (
            <>
              {group_id ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{groupIdTrigger}</TooltipTrigger>
                    <TooltipContent>
                      <p>{group_id}</p>
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

      columnHelper.accessor('token', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.token')}</span>
        ),
        cell: info => {
          const token = info.getValue()
          const tokenTrigger =
            token?.length > 10 ? token.slice(0, 10) + '...' : token
          return (
            <>
              {token ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{tokenTrigger}</TooltipTrigger>
                    <TooltipContent>
                      <p>{token}</p>
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
      columnHelper.accessor('org_id', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.org_id')}</span>
        ),
        cell: info => {
          const org_id = info.getValue()
          const orgIdTrigger =
            org_id?.length > 10 ? org_id.slice(0, 10) + '...' : org_id
          return (
            <>
              {org_id ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{orgIdTrigger}</TooltipTrigger>
                    <TooltipContent>
                      <p>{org_id}</p>
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

      columnHelper.accessor('template_id', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.template_id')}</span>
        ),
        cell: info => {
          const template_id = info.getValue()
          const templateIdTrigger =
            template_id?.length > 10
              ? template_id.slice(0, 10) + '...'
              : template_id
          return (
            <>
              {template_id ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{templateIdTrigger}</TooltipTrigger>
                    <TooltipContent>
                      <p>{template_id}</p>
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

      columnHelper.accessor('template_name', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.device_type')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('key', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.key')}</span>
        ),
        cell: info => {
          const key = info.getValue()
          const keyTrigger = key?.length > 10 ? key.slice(0, 10) + '...' : key
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
          getVNDateFormat({ date: parseInt(info.getValue()) * 1000 }),
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
            template_id,
            token,
            status,
          } = info.row.original

          return DeviceTableContextMenu({
            name,
            id,
            key,
            org_id,
            template_id,
            token,
            status,
            group_id,
            additional_info: info.row.original.additional_info,
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
      popoverClassName="absolute right-0 top-1 block"
      data={dataSorted}
      columns={columns}
      colsVisibility={colsVisibility}
      onDataText={t('table:no_device')}
      {...props}
    />
  )
}
