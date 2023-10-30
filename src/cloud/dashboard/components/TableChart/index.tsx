import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { defaultDateConfig, getVNDateFormat } from '~/utils/misc'
import { BaseTable } from '~/components/Table'

import { type DeviceAttrLog } from '~/cloud/orgManagement/api/attrAPI'
import { type TimeSeries } from '../../types'

type TableChartDataType = DeviceAttrLog & {
  entity_name: string
}

export function TableChart({
  data,
  ...props
}: {
  data: TimeSeries
  className?: string
}) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<TableChartDataType>()

  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    Array<
      Pick<TableChartDataType, 'ts' | 'value' | 'attribute_key' | 'entity_name'>
    >
  >([
    {
      ts: 0,
      value: 0,
      attribute_key: '',
      entity_name: '',
    },
  ])

  const newDataValue = data?.[Object.keys(data)?.[0]]?.[0].value ?? ''
  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      prevValuesRef.current = newValuesRef.current || data
      if (
        newValuesRef.current != null &&
        data[Object.keys(data)[0]].length === 1
      ) {
        for (const key in data) {
          if (
            prevValuesRef.current[key] != null &&
            (JSON.stringify(prevValuesRef.current[key]) !==
              JSON.stringify(newValuesRef.current[key]) ||
              JSON.stringify(prevValuesRef.current[key]) !==
                JSON.stringify(data[key]))
          ) {
            newValuesRef.current[key] = [
              ...prevValuesRef.current[key],
              ...data[key],
            ]
          } else {
            prevValuesRef.current = data
          }
          dataManipulation()
        }
      } else {
        newValuesRef.current = data
        dataManipulation()
      }
    }
  }, [newDataValue])

  function dataManipulation() {
    const tableWidgetDataType = Object.entries(
      newValuesRef.current as TimeSeries,
    )
      .flatMap(([attribute_key, values]) =>
        values.map(({ ts, value }) => ({
          ts: ts,
          attribute_key,
          value: parseFloat(value),
        })),
      )
      .toSorted((a, b) => b.ts - a.ts)

    setDataTransformedFeedToChart(tableWidgetDataType)
  }

  const columns = useMemo<ColumnDef<TableChartDataType, any>[]>(
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
      columnHelper.accessor('ts', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.last_update_ts')}</span>
        ),
        cell: info =>
          getVNDateFormat({
            date: parseInt(info.getValue()),
            config: {
              ...defaultDateConfig,
              second: '2-digit',
            },
          }),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('attribute_key', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.attr_key')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('value', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.value')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return dataTransformedFeedToChart != null &&
    dataTransformedFeedToChart?.length !== 0 ? (
    <BaseTable data={dataTransformedFeedToChart} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_log_attr')}
    </div>
  )
}
