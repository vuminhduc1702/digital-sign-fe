import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { BaseTable } from './BaseTable'

import { type PropertyValuePair, getVNDateFormat } from '~/utils/misc'

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

  return <BaseTable data={data} columns={columns} {...props} />
}

export default AttrTable
