import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'

import { BaseTable } from '../../../components/Table/BaseTable'
import { Dropdown, MenuItem } from '../../../components/Dropdown'
import { ConfirmationDialog } from '../../../components/ConfirmationDialog'
import { Button } from '../../../components/Button'
import { useDeleteAttr } from '~/cloud/orgManagement/api/deleteAttr'
import { UpdateAttr } from '~/cloud/orgManagement/components/UpdateAttr'
import { useDisclosure } from '~/utils/hooks'

import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { type PropertyValuePair, getVNDateFormat } from '~/utils/misc'
import { type EntityType } from '~/cloud/orgManagement/api/createAttr'

import { BtnContextMenuIcon } from '../../../components/SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

function DeviceTableContextMenu({
  entityId,
  entityType,
  attribute_key,
}: {
  entityId: string
  entityType: EntityType
  attribute_key: string
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteAttr()

  // TODO: Loading state for delete attr

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
                <img
                  src={btnEditIcon}
                  alt="Edit attribute"
                  className="h-5 w-5"
                />
              }
              onClick={open}
            >
              {t('cloud.org_manage.org_map.edit')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud.org_manage.org_manage.table.delete_attr_full')}
              body={
                t(
                  'cloud.org_manage.org_manage.table.delete_attr_confirm',
                ).replace('{{ATTRNAME}}', attribute_key) ?? 'Confirm delete?'
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
                      alt="Delete attribute"
                      className="h-5 w-5"
                    />
                  }
                >
                  {t('cloud.org_manage.org_manage.table.delete_attr')}
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
                    <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
      {isOpen ? (
        <UpdateAttr
          entityType={entityType}
          attributeKey={attribute_key}
          close={close}
          isOpen={isOpen}
        />
      ) : null}
    </>
  )
}

function DeviceTable({
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

  const columnHelper = createColumnHelper<PropertyValuePair<string>>()

  const dataSorted = data?.sort(
    (a, b) =>
      parseInt(a.last_update_ts as string) -
      parseInt(b.last_update_ts as string),
  )

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
      columnHelper.accessor('attribute_key', {
        header: () => (
          <span>{t('cloud.org_manage.org_manage.table.attr_key')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('value_type', {
        header: () => (
          <span>{t('cloud.org_manage.org_manage.table.value_type')}</span>
        ),
        cell: info => {
          const valueType = info.getValue()
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
          <span>{t('cloud.org_manage.org_manage.table.value')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('logged', {
        header: () => (
          <span>{t('cloud.org_manage.org_manage.table.logged')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('last_update_ts', {
        header: () => (
          <span>{t('cloud.org_manage.org_manage.table.last_update_ts')}</span>
        ),
        cell: info => getVNDateFormat(parseInt(info.getValue())),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('contextMenu', {
        cell: info => {
          const { attribute_key } = info.row.original
          return DeviceTableContextMenu({ entityId, attribute_key, entityType })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return <BaseTable data={dataSorted} columns={columns} {...props} />
}

export default DeviceTable
