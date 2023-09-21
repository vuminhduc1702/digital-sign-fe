import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Button } from '~/components/Button'
import { BaseTable } from '~/components/Table'

import { type BaseTablePagination } from '~/types'

import { format } from 'date-fns'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { type EntityConfigChart } from './CreateConfigChart'

function ConfigChartContextMenu({
  id,
  handleDelete,
}: {
  id: string
  handleDelete: (index: string) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    setIsSuccess(false)
  }, [id])

  return (
    <>
      <ConfirmationDialog
        isDone={isSuccess}
        icon="danger"
        title={''}
        body={'Confirm delete?'}
        triggerButton={
          <Button
            className="w-full border-none shadow-none hover:text-primary-400"
            style={{ justifyContent: 'flex-start' }}
            variant="trans"
            size="square"
            startIcon={
              <img src={btnDeleteIcon} alt="Delete thing" className="h-5 w-5" />
            }
          ></Button>
        }
        confirmButton={
          <Button
            // isLoading={isLoading}
            type="button"
            size="md"
            className="bg-primary-400"
            onClick={() => {
              handleDelete(id)
              setIsSuccess(true)
            }}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        }
      />
    </>
  )
}

type ConfigChartTableProps = {
  data: EntityConfigChart[]
  handleDataChart: (data: EntityConfigChart[]) => void
} & BaseTablePagination

export function ConfigChartTable({
  data,
  handleDataChart,
  ...props
}: ConfigChartTableProps) {
  const { t } = useTranslation()
  const [dataConvert, setDataConvert] = useState<EntityConfigChart[]>(data)
  useEffect(() => {
    setDataConvert(data)
  }, [data])

  const columnHelper = createColumnHelper<EntityConfigChart>()
  const handleDelete = (id: string) => {
    const dataFilter = data.filter(item => item.id !== id)
    handleDataChart(dataFilter)
    setDataConvert(dataFilter)
  }
  const columns = useMemo<ColumnDef<EntityConfigChart, any>[]>(
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
      columnHelper.accessor('device', {
        header: () => <span>{t('cloud:dashboard.config_chart.device')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('attr', {
        header: () => <span>{t('cloud:dashboard.config_chart.attr')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      // columnHelper.accessor('method', {
      //   header: () => <span>{t('cloud:dashboard.config_chart.method')}</span>,
      //   cell: info => info.getValue(),
      //   footer: info => info.column.id,
      // }),
      // columnHelper.display({
      //   id: 'date',
      //   cell: info => {
      //     const dateFormat = info.row.original.date
      //     return (
      //       <>
      //         {dateFormat?.from ? (
      //           dateFormat.to ? (
      //             <>
      //               {format(dateFormat.from, 'dd/MM/y')} -{' '}
      //               {format(dateFormat.to, 'dd/MM/y')}
      //             </>
      //           ) : (
      //             format(dateFormat.from, 'dd/MM/y')
      //           )
      //         ) : (
      //           <span> </span>
      //         )}
      //       </>
      //     )
      //   },
      //   header: () => <span>{t('cloud:dashboard.config_chart.date')}</span>,
      //   footer: info => info.column.id,
      // }),
      columnHelper.accessor('color', {
        header: () => <span>{t('cloud:dashboard.config_chart.color')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          console.log(info.row.original)
          const id = info.row.original.id

          return ConfigChartContextMenu({ id, handleDelete })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [data],
  )

  return dataConvert != null && dataConvert?.length !== 0 ? (
    <BaseTable data={dataConvert} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {'Không có data'}
    </div>
  )
}
