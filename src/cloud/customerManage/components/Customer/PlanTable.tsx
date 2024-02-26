import {
  createColumnHelper,
  type ColumnDef,
  type Row,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseTable } from '~/components/Table'

import { type BaseTablePagination } from '~/types'

import { LuChevronDown, LuChevronRight } from 'react-icons/lu'
import { type Subcription } from '~/cloud/subcription'
import { InputField } from '~/components/Form'
import { getVNDateFormat } from '~/utils/misc'

type CustomerTableProps = {
  data?: Subcription[]
} & BaseTablePagination

export function PlanTable({ data, ...props }: CustomerTableProps) {
  const { t } = useTranslation()

  const renderSubComponent = ({ row }: { row: Row<Subcription> }) => {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-3">
            <p className="text-table-header">
              {t('billing:customer_manage.plan_detail.title')}
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <InputField
            label={t('billing:customer_manage.plan_detail.name')}
            value={row.original?.p_name || ''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.plan_detail.start_date')}
            value={
              row.original?.s_date_register
                ? getVNDateFormat({
                    date: row.original?.s_date_register * 1000,
                  })
                : ''
            }
            disabled
          />
          <InputField
            label={t('billing:customer_manage.plan_detail.end_date')}
            value={''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.plan_detail.payment_type')}
            value={
              row.original?.p_payment_type
                ? row.original?.p_payment_type === 'PREPAY'
                  ? 'Trả trước'
                  : 'Trả sau'
                : ''
            }
            disabled
          />
          <InputField
            label={t('billing:customer_manage.plan_detail.quantity_purchased')}
            value={''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.plan_detail.used')}
            value={''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.plan_detail.result')}
            value={''}
            disabled
          />
        </div>
      </div>
    )
  }

  const columnHelper = createColumnHelper<Subcription>()
  const columns = useMemo<ColumnDef<Subcription, any>[]>(
    () => [
      columnHelper.display({
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          return (
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: 'pointer' },
              }}
            >
              {row.getIsExpanded() ? (
                <LuChevronDown className="size-5" />
              ) : (
                <LuChevronRight className="size-5" />
              )}
            </button>
          )
        },
      }),
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('s_id', {
        header: () => (
          <span>{t('billing:customer_manage.table_plan.sub_id')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('p_id', {
        header: () => (
          <span>{t('billing:customer_manage.table_plan.plan_id')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('p_name', {
        header: () => (
          <span>{t('billing:customer_manage.table_plan.plan_name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('p_price', {
        header: () => (
          <span>{t('billing:customer_manage.table_plan.cost')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return (
    <BaseTable
      getRowCanExpand={() => true}
      renderSubComponent={renderSubComponent}
      data={data}
      columns={columns}
      onDataText={t('table:no_plan_used')}
      {...props}
    />
  )
}
