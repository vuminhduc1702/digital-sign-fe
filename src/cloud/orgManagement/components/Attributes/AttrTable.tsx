import { Menu } from '@headlessui/react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedCallback } from 'use-debounce'

import {
  useDeleteAttr,
  type EntityType,
} from '~/cloud/orgManagement/api/attrAPI'
import { UpdateAttr } from '~/cloud/orgManagement/components/Attributes'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { Switch } from '~/components/Switch'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'
import { getVNDateFormat } from '~/utils/misc'
import { useUpdateLogged } from '../../api/attrAPI/updateLogged'

import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { type Attribute } from '~/types'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { useGetAttrs } from '../../api/attrAPI/getAttrs'

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
  value: string | number | boolean
  value_type: Attribute['value_type']
  logged: boolean
}) {
  const { t } = useTranslation()
  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteAttr()

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
                <img
                  src={btnEditIcon}
                  alt="Edit attribute"
                  className="size-5"
                />
              }
              onClick={open}
            >
              {t('cloud:org_manage.org_manage.add_attr.edit')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:org_manage.org_manage.table.delete_attr_full')}
              body={t(
                'cloud:org_manage.org_manage.table.delete_attr_confirm',
              ).replace('{{ATTRNAME}}', attribute_key)}
              triggerButton={
                <Button
                  className="w-full justify-start border-none hover:text-primary-400"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete attribute"
                      className="size-5"
                    />
                  }
                >
                  {t('cloud:org_manage.org_manage.table.delete_attr')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() =>
                    mutate({
                      entityId,
                      entityType,
                      attrKey: attribute_key,
                    })
                  }
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
        <UpdateAttr
          entityId={entityId}
          entityType={entityType}
          attributeKey={attribute_key}
          close={close}
          isOpen={isOpen}
          {...props}
        />
      ) : null}
    </>
  )
}

export function AttrTable({
  data,
  entityId,
  entityType,
  ...props
}: {
  data: Attribute[]
  entityId: string
  entityType: EntityType
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
}) {
  const { t } = useTranslation()
  const { mutate: mutateUpdateLogged } = useUpdateLogged()
  const columnHelper = createColumnHelper<Attribute>()

  const { data: attrsData } = useGetAttrs({ entityType, entityId })

  const dataSorted =
    attrsData?.attributes.sort((a, b) =>
      b.attribute_key < a.attribute_key ? 1 : -1,
    ) || attrsData?.attributes

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
        cell: info => (info.getValue() !== 'null' ? info.getValue() : ''),
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
              defaultChecked={info.getValue() === 'true' ? true : false}
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
    ],
    [entityId, entityType],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={dataSorted}
      columns={columns}
      onDataText={t('table:no_attr')}
      isAbsoluteBtn={false}
      {...props}
    />
  )
}
