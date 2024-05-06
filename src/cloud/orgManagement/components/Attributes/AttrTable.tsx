import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedCallback } from 'use-debounce'

import {
  useDeleteAttr,
  type EntityType,
} from '@/cloud/orgManagement/api/attrAPI'
import { UpdateAttr } from '@/cloud/orgManagement/components/Attributes'
import { Button } from '@/components/ui/button'

import { Switch } from '@/components/ui/switch'
import { BaseTable, type BaseTableProps } from '@/components/Table'
import { useDisclosure } from '@/utils/hooks'
import { getVNDateFormat } from '@/utils/misc'
import { useUpdateLogged } from '../../api/attrAPI/updateLogged'

import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { type Attribute } from '@/types'

import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnEditIcon from '@/assets/icons/btn-edit.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '@/components/SVGIcons'
import { useGetAttrs } from '../../api/attrAPI/getAttrs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { LuEye, LuPen, LuTrash2, LuMoreVertical, LuFiles } from 'react-icons/lu'
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const STATUS = {
  true: 'Có',
  false: 'Không',
}

function AttrTableContextMenu({
  entityId,
  entityType,
  attribute_key,
  ...props
}: {
  entityId: string
  entityType: EntityType
  attribute_key: string
  value: unknown
  value_type: Attribute['value_type']
  logged: boolean
}) {
  const { t } = useTranslation()
  const { close, open, isOpen } = useDisclosure()
  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteAttr()

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
          <LuTrash2
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={openDelete}
          />
        </div>
        {/* <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex cursor-pointer justify-center p-3">
              <LuMoreVertical              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={open}>
              <img src={btnEditIcon} alt="Edit attribute" className="h-5 w-5" />
              {t('cloud:org_manage.org_manage.add_attr.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDelete}>
              <img
                src={btnDeleteIcon}
                alt="Delete attribute"
                className="h-5 w-5"
              />
              {t('cloud:org_manage.org_manage.table.delete_attr')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      {isOpen ? (
        <UpdateAttr
          entityId={entityId}
          entityType={entityType}
          attributeKey={attribute_key}
          close={close}
          isOpen={isOpen}
          {...props}
        />
      ) : null}

      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.org_manage.table.delete_attr_full')}
          body={t(
            'cloud:org_manage.org_manage.table.delete_attr_confirm',
          ).replace('{{ATTRNAME}}', attribute_key)}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() =>
            mutate({
              entityId,
              entityType,
              attrKey: attribute_key,
            })
          }
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}

type PartialBaseTableProps<T> = Omit<
  BaseTableProps<Attribute>,
  'columns' | 'offset' | 'setOffset'
> & {
  columns?: ColumnDef<T, any>[]
  offset?: number
  setOffset?: React.Dispatch<React.SetStateAction<number>>
}

export function AttrTable({
  data,
  entityId,
  entityType,
  ...props
}: {
  data?: Attribute[]
  entityId: string
  entityType: EntityType
} & PartialBaseTableProps<Attribute>) {
  const { t } = useTranslation()
  const { mutate: mutateUpdateLogged } = useUpdateLogged()
  const columnHelper = createColumnHelper<Attribute>()

  const dataSorted = data?.sort((a, b) =>
    b.attribute_key < a.attribute_key ? 1 : -1,
  )

  const handleSwitchChange = (checked: boolean, attributeKey: string) => {
    mutateUpdateLogged({
      data: {
        logged: checked,
      },
      device_id: entityId,
      attribute_key: attributeKey,
      entityType: entityType,
    })
  }
  const debouncedSwitchChange = useDebouncedCallback(handleSwitchChange, 500)

  const columns = useMemo<ColumnDef<Attribute, any>[]>(
    () => [
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { attribute_key, value, value_type, logged } = info.row.original
          return AttrTableContextMenu({
            entityId,
            entityType,
            attribute_key,
            value,
            value_type,
            logged,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('attribute_key', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.attr_key')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('value_type', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.value_type')}</span>
        ),
        cell: info => {
          const valueType: Attribute['value_type'] = info.getValue()
          switch (valueType) {
            case 'STR':
              return 'String'
            case 'BOOL':
              return 'Boolean'
            case 'LONG':
              return 'Long'
            case 'DBL':
              return 'Double'
            case 'JSON':
              return 'JSON'
            default:
              return ''
          }
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('value', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.value')}</span>
        ),
        cell: info => {
          const value = JSON.stringify(info.getValue())
          const valueTrigger =
            value?.length > 10 ? value.slice(0, 10) + '...' : value

          if (JSON.parse(value) === '') return undefined

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>{valueTrigger}</TooltipTrigger>
                <TooltipContent>
                  <p>{value}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('logged', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.logged')}</span>
        ),
        cell: info => {
          const { attribute_key } = info.row.original

          return (
            <Switch
              key={attribute_key + +info.getValue()}
              defaultChecked={info.getValue() ? true : false}
              onCheckedChange={checked => {
                debouncedSwitchChange(checked, attribute_key)
              }}
            />
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('last_update_ts', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.last_update_ts')}</span>
        ),
        cell: info => getVNDateFormat({ date: parseInt(info.getValue()) }),
        footer: info => info.column.id,
      }),
    ],
    [entityId, entityType],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={dataSorted ?? []}
      columns={columns}
      onDataText={t('table:no_attr')}
      isAbsoluteBtn={false}
      {...props}
    />
  )
}
