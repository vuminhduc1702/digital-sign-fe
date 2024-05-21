import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { defaultDateConfig, getVNDateFormat } from '@/utils/misc'
import { BaseTable } from '@/components/Table'

import { type DeviceAttrLog } from '@/cloud/orgManagement/api/attrAPI'
import { type TimeSeries } from '../../types'
import type * as z from 'zod'
import { type widgetSchema } from '../Widget'
import refreshIcon from '@/assets/icons/table-refresh.svg'
import { Spinner } from '@/components/Spinner'

type TableChartDataType = DeviceAttrLog & {
  entity_name: string
  label: string
}

export function TableChart({
  data,
  widgetInfo,
  refetchData = () => {},
  refreshBtn,
  widgetListRef,
  ...props
}: {
  data: TimeSeries
  widgetInfo: z.infer<typeof widgetSchema>
  refetchData?: () => void
  refreshBtn?: boolean
  widgetListRef?: React.MutableRefObject<string[]>
  className?: string
}) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<TableChartDataType>()

  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] =
    useState<
      Array<
        Pick<
          TableChartDataType,
          'ts' | 'value' | 'attribute_key' | 'label' | 'entity_name' | 'unit'
        >
      >
    >()
  const [isRefresh, setIsRefresh] = useState<boolean>(false)

  useEffect(() => {
    if (
      widgetInfo?.config?.chartsetting?.data_type === 'HISTORY' &&
      widgetListRef?.current.includes(widgetInfo?.id)
    ) {
      if (Object.keys(data).length > 0) {
        newValuesRef.current = data
        if (widgetListRef && widgetListRef.current.includes(widgetInfo?.id)) {
          widgetListRef.current = widgetListRef.current.filter(
            item => item !== widgetInfo?.id,
          )
        }
        if (newValuesRef.current != null) {
          dataManipulation()
        }
      }
    }

    if (widgetInfo?.config?.chartsetting?.data_type !== 'HISTORY') {
      if (Object.keys(data).length > 0) {
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
    }
  }, [data])

  // extract data from attribute_key. eg: 'device1 - attr1 - 123' => ['device1', 'attr1', '123']
  function extractKey(label: string) {
    return label.split(' - ')
  }

  function dataManipulation() {
    const tableWidgetDataType = Object.entries(
      newValuesRef.current as TimeSeries,
    )
      .flatMap(([attribute_key, values]) =>
        values.map(({ ts, value }) => ({
          ts: ts,
          attribute_key: extractKey(attribute_key)[0],
          label: extractKey(attribute_key)[1],
          value,
          unit: widgetInfo.attribute_config.filter(
            obj =>
              obj.attribute_key === extractKey(attribute_key)[0] &&
              obj.label === extractKey(attribute_key)[2],
          )[0]?.unit,
          entity_name: '',
        })),
      )
      .toSorted((a, b) => b.ts - a.ts)
    setDataTransformedFeedToChart(tableWidgetDataType)
  }

  function signalParent() {
    refetchData()
  }

  const columns = useMemo<ColumnDef<TableChartDataType, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1,
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
      columnHelper.accessor('label', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.label')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('unit', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.unit')}</span>
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

  // refresh table
  function refresh() {
    setIsRefresh(true)
    widgetListRef?.current.push(widgetInfo?.id)
    refetchData?.()
    setInterval(() => {
      setIsRefresh(false)
    }, 1000)
  }

  return (
    <>
      {isRefresh ? (
        <div className="flex h-full items-center justify-center">
          <Spinner size="xl" />
        </div>
      ) : (
        <>
          {refreshBtn && (
            <div
              className="absolute right-[95px] top-[10px] z-20 cursor-pointer"
              onClick={refresh}
            >
              <img src={refreshIcon} alt="" />
            </div>
          )}
          <BaseTable
            data={dataTransformedFeedToChart}
            columns={columns}
            isAbsoluteBtn={false}
            isCheckbox={false}
            onDataText={t('table:no_log_attr')}
            refreshBtn={refreshBtn}
            callbackParent={signalParent}
            {...props}
          />
        </>
      )}
    </>
  )
}
