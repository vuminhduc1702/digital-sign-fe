import { useMemo, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useNavigate, useParams } from 'react-router-dom'
import {
  type ColumnDef,
  createColumnHelper,
  filterFns,
} from '@tanstack/react-table'

import { Button } from '@/components/Button'
import { BaseTable } from '@/components/Table'
import { useCopyId, useDisclosure } from '@/utils/hooks'
import { PATHS } from '@/routes/PATHS'
import { UpdateDevice } from './UpdateDevice'
import { getVNDateFormat } from '@/utils/misc'
import { useDeleteDevice } from '../../api/deviceAPI'
import storage from '@/utils/storage'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip'

import { type DeviceAdditionalInfo, type Device } from '../../types'
import { type BaseTablePagination } from '@/types'

import { BtnContextMenuIcon } from '@/components/SVGIcons'
import btnEditIcon from '@/assets/icons/btn-edit.svg'
import btnDetailIcon from '@/assets/icons/btn-detail.svg'
import btnCopyIdIcon from '@/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { UpdateIcon, CopyIcon } from '@radix-ui/react-icons'
import { UpdateVersionFirmWare } from './UpdateVersionFirmware'
import { useBlockAndActiveDevice } from '../../api/deviceAPI/blockAndActiveDevice'
import { UpdateMqttConfig } from './UpdateMqttConfig'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/Dropdowns'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { LuEye, LuPen, LuTrash2, LuMoreVertical, LuFiles } from 'react-icons/lu'
import { type BaseTableProps } from '@/components/Table'

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

  const { close, open, isOpen } = useDisclosure()
  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const {
    close: closeUpdateMqtt,
    open: openUpdateMqtt,
    isOpen: isOpenUpdateMqtt,
  } = useDisclosure()

  const {
    close: closeUpdateVersion,
    open: openUpdateVersion,
    isOpen: isOpenUpdateVersion,
  } = useDisclosure()

  const projectId = storage.getProject()?.id
  const { orgId } = useParams()

  const { mutate, isLoading, isSuccess } = useDeleteDevice()

  const { mutate: mutateBlockAndActive } = useBlockAndActiveDevice()

  const handleCopyId = useCopyId()

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
          <LuFiles
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={() => handleCopyId(id)}
          />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <LuTrash2
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={openDelete}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex cursor-pointer justify-center p-3">
              <LuMoreVertical className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  `${PATHS.DEVICE_MANAGE}/${projectId}/${
                    orgId != null ? `${orgId}/${id}` : ` /${id}`
                  }`,
                )
              }
            >
              <img src={btnDetailIcon} alt="View device" className="h-5 w-5" />
              {t('table:view_detail')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={open}>
              <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
              {t('cloud:org_manage.device_manage.add_device.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openUpdateMqtt}>
              <img
                src={btnEditIcon}
                alt="Edit mqtt config"
                className="h-5 w-5"
              />
              {t('cloud:org_manage.device_manage.add_device.mqttconfig')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                let type = 'active'
                if (status === 'online' || status === 'offline') {
                  type = 'block'
                }
                mutateBlockAndActive({ type, deviceId: id })
              }}
            >
              <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
              {status === 'online' || status === 'offline'
                ? t('device:block')
                : t('device:active')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (status !== 'blocked') openUpdateVersion()
              }}
              style={{
                color: status === 'blocked' ? 'gray' : '',
                cursor: status === 'blocked' ? 'not-allowed' : 'pointer',
              }}
            >
              <UpdateIcon className="h-5 w-5" />
              {t('cloud:firmware.fota')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyId(id)}>
              <img
                src={btnCopyIdIcon}
                alt="Copy device's ID"
                className="h-5 w-5"
              />
              {t('table:copy_id')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyId(token, 'token')}>
              <CopyIcon className="h-5 w-5" />
              {t('table:copy_token')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDelete}>
              <img
                src={btnDeleteIcon}
                alt="Delete device"
                className="h-5 w-5"
              />
              {t('cloud:org_manage.device_manage.table.delete_device')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isOpen ? (
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
      {isOpenUpdateVersion ? (
        <UpdateVersionFirmWare
          deviceId={id}
          close={closeUpdateVersion}
          isOpen={isOpenUpdateVersion}
        />
      ) : null}
      {isOpenUpdateMqtt && additional_info != null ? (
        <UpdateMqttConfig
          additional_info={additional_info}
          deviceId={id}
          close={closeUpdateMqtt}
          isOpen={isOpenUpdateMqtt}
        />
      ) : null}

      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.device_manage.table.delete_device_full')}
          body={t(
            'cloud:org_manage.device_manage.table.delete_device_confirm',
          ).replace('{{DEVICENAME}}', name)}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() => mutate({ id })}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}

type PartialBaseTableProps<T> = Omit<BaseTableProps<Device>, 'columns'> & {
  columns?: ColumnDef<T, any>[]
}

type DeviceTableProps = {
  data: Device[]
} & PartialBaseTableProps<Device>

export function DeviceTable({ data, ...props }: DeviceTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const projectId = storage.getProject()?.id

  const { orgId } = useParams()

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

  const offsetPrev = useRef<number>(props.offset)

  useEffect(() => {
    if (props.isPreviousData && offsetPrev.current < props.offset) {
      offsetPrev.current = props.offset
    }
  }, [props.isPreviousData])

  function navigateToDetail(id: string) {
    navigate(
      `${PATHS.DEVICE_MANAGE}/${projectId}/${
        orgId != null ? `${orgId}/${id}` : ` /${id}`
      }`,
    )
  }

  const columns = useMemo<ColumnDef<Device, any>[]>(
    () => [
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
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.name')}</span>
        ),
        cell: info => info.row.original.name,
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
      viewDetailOnClick={navigateToDetail}
      {...props}
    />
  )
}
