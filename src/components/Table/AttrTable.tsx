import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { BaseTable } from './BaseTable'
import { Dropdown, MenuItem } from '../Dropdown'
import { ConfirmationDialog } from '../ConfirmationDialog'
import { Button } from '../Button'
import { useNotificationStore } from '~/stores/notifications'
import { useDeleteAttr } from '~/cloud/orgManagement/api/deleteAttr'

import { type PropertyValuePair, getVNDateFormat } from '~/utils/misc'

import { BtnContextMenuIcon } from '../SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

function AttrTableContextMenu() {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  const { mutate, isLoading, isSuccess } = useDeleteAttr()

  const handleCopy = async (orgId: string) => {
    try {
      await navigator.clipboard.writeText(orgId)
      addNotification({
        type: 'success',
        title: t('cloud.org_manage.org_map.copy_success'),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
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
      <MenuItem
        icon={
          <img src={btnEditIcon} alt="Edit organization" className="h-5 w-5" />
        }
        // onClick={() => {
        //   open()
        //   setSelectedUpdateOrg(org.id)
        // }}
      >
        {t('cloud.org_manage.org_map.edit')}
      </MenuItem>
      <MenuItem
        icon={
          <img
            src={btnCopyIdIcon}
            alt="Copy organization's ID"
            className="h-5 w-5"
          />
        }
        // onClick={() => handleCopy(org.id)}
      >
        {t('cloud.org_manage.org_map.copy_id')}
      </MenuItem>
      <ConfirmationDialog
        isDone={isSuccess}
        icon="danger"
        title={t('cloud.org_manage.org_map.delete')}
        body={
          t('cloud.org_manage.org_map.delete_org_confirm').replace(
            '{{ORGNAME}}',
            org?.name,
          ) ?? 'Confirm delete?'
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
                alt="Delete organization"
                className="h-5 w-5"
              />
            }
          >
            {t('cloud.org_manage.org_map.delete')}
          </Button>
        }
        confirmButton={
          <Button
            isLoading={isLoading}
            type="button"
            size="md"
            className="bg-primary-400"
            // onClick={() => mutate({ orgId: org.id })}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        }
      />
    </Dropdown>
  )
}

function AttrTable({ data, ...props }: { data: PropertyValuePair<string>[] }) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<PropertyValuePair<string>>()

  const columns = useMemo<ColumnDef<PropertyValuePair<string>, string>[]>(
    () => [
      columnHelper.accessor('id', {
        cell: info => {
          const orderId = parseInt(info.row.id) + 1
          return orderId
        },
        header: () => <span>{t('table.no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('attribute_key', {
        header: () => (
          <span>{t('cloud.org_manage.org_info.table.attr_key')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('value_type', {
        header: () => (
          <span>{t('cloud.org_manage.org_info.table.value_type')}</span>
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
        header: () => <span>{t('cloud.org_manage.org_info.table.value')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('last_update_ts', {
        header: () => (
          <span>{t('cloud.org_manage.org_info.table.last_update_ts')}</span>
        ),
        cell: info => getVNDateFormat(parseInt(info.getValue())),
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return (
    <BaseTable
      data={data}
      columns={columns}
      // contextMenu={AttrTableContextMenu()}
      {...props}
    />
  )
}

export default AttrTable
