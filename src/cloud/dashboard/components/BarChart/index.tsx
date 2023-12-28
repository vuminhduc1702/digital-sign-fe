import { useEffect, useRef, useState } from 'react'
import {
  BarChart as BarReChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts'
import { useSpinDelay } from 'spin-delay'
import type * as z from 'zod'

import { Spinner } from '~/components/Spinner'
import { defaultDateConfig, getVNDateFormat } from '~/utils/misc'

import { type TimeSeries } from '../../types'
import { type widgetSchema } from '../Widget'
import refreshIcon from '~/assets/icons/table-refresh.svg'

export const BarChart = ({
  data,
  widgetInfo,
  refetchData,
  refreshBtn,
}: {
  data: TimeSeries
  widgetInfo: z.infer<typeof widgetSchema>
  refetchData?: () => void
  refreshBtn?: boolean
}) => {
  // console.log(`new bar: `, data)
  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    Array<{ time: string; [key: string]: string | number }>
  >([
    {
      time: '',
    },
  ])
  const [isRefresh, setIsRefresh] = useState<boolean>(false)

  useEffect(() => {
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
  }, [data])

  function dataManipulation() {
    const barWidgetDataType = Object.entries(
      newValuesRef.current as TimeSeries,
    ).reduce(
      (
        result: Array<{ time: number; [key: string]: string | number }>,
        [key, items],
      ) => {
        items.forEach(item => {
          const time = item.ts
          const value = parseFloat(item.value)
          const existingIndex = result.findIndex(obj => obj.time === time)
          if (existingIndex === -1) {
            result.push({ time, [key]: value })
          } else {
            result[existingIndex][key] = value
          }
        })

        return result.sort((a, b) => a.time - b.time)
      },
      [],
    )

    setDataTransformedFeedToChart(
      barWidgetDataType.map(item => {
        return {
          ...item,
          time: dateTransformation(item.time),
        }
      }),
    )
  }

  function dateTransformation(date: number) {
    if (widgetInfo?.config != null) {
      const { year, month, day, ...dateTimeOptionsWithoutYearMonthDay } =
        defaultDateConfig
      const timePeriod =
        widgetInfo.config.chartsetting.time_period ||
        widgetInfo.config.chartsetting.end_date -
          widgetInfo.config.chartsetting.start_date
      let dateVNFormat = ''
      if (timePeriod <= 60 * 1000) {
        dateVNFormat = getVNDateFormat({
          date,
          config: {
            ...dateTimeOptionsWithoutYearMonthDay,
            second: '2-digit',
          },
        })
      } else if (timePeriod <= 1 * 24 * 60 * 60 * 1000) {
        dateVNFormat = getVNDateFormat({
          date,
          config: {
            ...dateTimeOptionsWithoutYearMonthDay,
          },
        })
      } else if (timePeriod <= 7 * 24 * 60 * 60 * 1000) {
        dateVNFormat = getVNDateFormat({
          date,
          config: {
            day,
            ...dateTimeOptionsWithoutYearMonthDay,
          },
        })
      } else if (timePeriod <= 180 * 24 * 60 * 60 * 1000) {
        dateVNFormat = getVNDateFormat({
          date,
          config: {
            month,
            day,
          },
        })
      } else if (timePeriod <= 365 * 24 * 60 * 60 * 1000) {
        dateVNFormat = getVNDateFormat({
          date,
          config: {
            month,
          },
        })
      } else if (timePeriod <= 5 * 365 * 24 * 60 * 60 * 1000) {
        dateVNFormat = getVNDateFormat({
          date,
          config: {
            year,
            month,
          },
        })
      } else {
        dateVNFormat = getVNDateFormat({
          date,
          config: {
            year,
          },
        })
      }

      return dateVNFormat
    }

    return ''
  }

  const showSpinner = useSpinDelay(dataTransformedFeedToChart[0].time === '', {
    delay: 400,
    minDuration: 500,
  })

  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="pt-3 text-center">
        {payload.reverse().map((entry: any, index: number) => {
          const unitConfig = widgetInfo.attribute_config.filter(
            obj => obj.attribute_key === entry.dataKey,
          )
          return (
            <span key={`item-${index}`} className="pr-4">
              <div
                style={{
                  marginRight: '3px',
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: entry.color,
                }}
              ></div>
              {unitConfig && unitConfig.length > 0 && unitConfig[0].unit !== ''
                ? entry.value + ' (' + unitConfig[0].unit + ')'
                : entry.value}
            </span>
          )
        })}
      </div>
    )
  }

  function refresh() {
    setIsRefresh(true)
    refetchData?.()
    setInterval(() => {
      setIsRefresh(false)
    }, 1000)
  }

  // console.log('transform bar', dataTransformedFeedToChart)

  return (
    <>
      {!showSpinner && newValuesRef.current != null && !isRefresh ? (
        <>
          {refreshBtn && (
            <div
              className="absolute top-[50px] left-[10px] cursor-pointer z-20"
              onClick={refresh}
            >
              <img src={refreshIcon} alt="" />
            </div>
          )}
          <ResponsiveContainer width="98%" height="90%" className="pt-8">
            <BarReChart data={dataTransformedFeedToChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend content={renderLegend} />
              <Brush dataKey="time" height={30} stroke="#8884d8" />
              {Object.keys(newValuesRef.current).map((key, index) => {
                const colorConfig = widgetInfo.attribute_config.filter(
                  obj => obj.attribute_key === key,
                )
                return (
                  <Bar
                    key={index.toString()}
                    dataKey={key}
                    animationDuration={250}
                    barSize={10}
                    stroke={
                      colorConfig && colorConfig[0].color !== ''
                        ? colorConfig[0].color
                        : '#e8c1a0'
                    }
                    fill={
                      colorConfig && colorConfig[0].color !== ''
                        ? colorConfig[0].color
                        : '#e8c1a0'
                    }
                  />
                )
              })}
              {/* stackId="a" */}
            </BarReChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Spinner
            //  showSpinner={showSpinner}
            size="xl"
          />
        </div>
      )}
    </>
  )
}
