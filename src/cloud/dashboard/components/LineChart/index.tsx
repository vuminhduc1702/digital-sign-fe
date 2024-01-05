import { useEffect, useRef, useState } from 'react'
import { useSpinDelay } from 'spin-delay'
import {
  LineChart as LineWidget,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from 'recharts'
import type * as z from 'zod'

import { Spinner } from '~/components/Spinner'
import { defaultDateConfig, getVNDateFormat } from '~/utils/misc'

import { type TimeSeries } from '../../types'
import { type widgetSchema } from '../Widget'
import refreshIcon from '~/assets/icons/table-refresh.svg'

import * as d3 from 'd3'

export function LineChart({
  data,
  widgetInfo,
  refetchData,
  refreshBtn,
}: {
  data: TimeSeries
  widgetInfo: z.infer<typeof widgetSchema>
  refetchData?: () => void
  refreshBtn?: boolean
}) {
  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    Array<{ ts: string; [key: string]: string | number }>
  >([
    {
      ts: '',
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
    const lineWidgetDataType = Object.entries(
      newValuesRef.current as TimeSeries,
    ).reduce(
      (
        result: Array<{ ts: number; [key: string]: string | number }>,
        [key, items],
      ) => {
        items.forEach(item => {
          const time = item.ts
          const value = parseFloat(item.value)
          const existingIndex = result.findIndex(obj => obj.ts === time)
          if (existingIndex === -1) {
            result.push({ ts: time, [key]: value })
          } else {
            result[existingIndex][key] = value
          }
        })

        return result.sort((a, b) => a.ts - b.ts)
      },
      [],
    )

    const lineWidgetDataTypeToChart: Array<{
      ts: string
      [key: string]: string | number
    }> = lineWidgetDataType.map(item => {
      return {
        ...item,
        ts: dateTransformation(item.ts),
      }
    })
    setDataTransformedFeedToChart(lineWidgetDataTypeToChart)
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

  const showSpinner = useSpinDelay(dataTransformedFeedToChart[0].ts === '', {
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

  const TICK_INTERVAL = 10000
  const [ticks, setTicks] = useState<any[]>(initTick())

  function timeFormatter(tick: any | null) {
    return d3.timeFormat('%H:%M:%S')(new Date(tick))
  }

  function initTick() {
    const now = new Date()
    // rounded to the nearest 10 seconds
    const rounded = now.getSeconds() - (now.getSeconds() % 10)
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      rounded,
    )

    // create an array of 6 ticks
    const initTicks = []
    for (let i = 5; i >= 0; i--) {
      initTicks.push(
        new Date(start.getTime() - (i + 1) * TICK_INTERVAL).getTime(),
      )
    }
    initTicks.push(start.getTime())

    return initTicks
  }

  function convertTimeToStringTime(time: number[]) {
    return time.map(item => {
      return timeFormatter(item)
    })
  }

  function addTick() {
    if (new Date().getSeconds() % (TICK_INTERVAL / 1000) === 0) {
      setTicks(prev =>
        prev.length > 6
          ? [...prev.slice(1), new Date().getTime()]
          : [...prev, new Date().getTime()],
      )
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      addTick()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  console.log(newValuesRef.current)

  const start = new Date();
  const end = new Date(start.getTime() - 60 * 60 * 1000);

  const xScale = d3.scaleTime()
  .domain([end, start])
  .range([0, 10000])

  console.log(xScale);

  return (
    <>
      {refreshBtn && (
        <div
          className="absolute top-[50px] left-[10px] cursor-pointer z-20"
          onClick={refresh}
        >
          <img src={refreshIcon} alt="" />
        </div>
      )}
      {widgetInfo?.config?.chartsetting.data_type === 'HISTORY' ? (
        !showSpinner && newValuesRef.current != null && !isRefresh ? (
          <>
            <ResponsiveContainer width="98%" height="90%" className="pt-8">
              <LineWidget data={dataTransformedFeedToChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={ticks} allowDuplicatedCategory={false} />
                <YAxis />
                <Tooltip />
                <Legend content={renderLegend} />
                <Brush dataKey="ts" height={30} stroke="#8884d8" />
                {Object.keys(newValuesRef.current).map((key, index) => {
                  const colorConfig = widgetInfo.attribute_config.filter(
                    obj => obj.attribute_key === key,
                  )
                  return (
                    <Line
                      key={index.toString()}
                      connectNulls
                      type="monotone"
                      dataKey={key}
                      animationDuration={250}
                      stroke={
                        key.includes('SMA') || key.includes('FFT')
                          ? '#2c2c2c'
                          : colorConfig && colorConfig[0].color !== ''
                          ? colorConfig[0].color
                          : '#e8c1a0'
                      }
                      activeDot={{ r: 5 }}
                      dot={false}
                    />
                  )
                })}
              </LineWidget>
            </ResponsiveContainer>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Spinner size="xl" />
          </div>
        )
      ) : !showSpinner && newValuesRef.current != null ? (
        <>
          <ResponsiveContainer width="98%" height="90%" className="pt-8">
            <LineWidget data={dataTransformedFeedToChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="ts"
                scale="time"
                type="number"
                domain={[ticks[0], ticks[ticks.length - 1]]}
                ticks={ticks}
                tickCount={ticks.length}
                tickFormatter={timeFormatter}
              />
              <YAxis />
              <Tooltip />
              <Legend content={renderLegend} />
              <Brush dataKey="ts" height={30} stroke="#8884d8" />
              <Line
                connectNulls
                type="monotone"
                dataKey="value"
                animationDuration={250}
                stroke="#2c2c2c"
                activeDot={{ r: 5 }}
                dot={false}
              />
              {Object.keys(newValuesRef.current).map((key, index) => {
                const colorConfig = widgetInfo.attribute_config.filter(
                  obj => obj.attribute_key === key,
                )
                return (
                  <Line
                    key={index.toString()}
                    connectNulls
                    type="monotone"
                    dataKey={key}
                    animationDuration={250}
                    stroke={
                      key.includes('SMA') || key.includes('FFT')
                        ? '#2c2c2c'
                        : colorConfig && colorConfig[0].color !== ''
                        ? colorConfig[0].color
                        : '#e8c1a0'
                    }
                    activeDot={{ r: 5 }}
                    dot={false}
                  />
                )
              })}
            </LineWidget>
          </ResponsiveContainer>
        </>
      ) : (
        <>
          <ResponsiveContainer width="98%" height="90%" className="pt-8">
            <LineWidget data={dataTransformedFeedToChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="ts"
                scale="time"
                type="number"
                domain={[ticks[0], ticks[ticks.length - 1]]}
                ticks={ticks}
                tickCount={ticks.length}
                tickFormatter={timeFormatter}
              />
              <YAxis />
              <Tooltip />
              <Legend content={renderLegend} />
              <Brush dataKey="ts" height={30} stroke="#8884d8" />
              {/* <Line
                connectNulls
                type="monotone"
                dataKey="value"
                animationDuration={250}
                stroke="#2c2c2c"
                activeDot={{ r: 5 }}
                dot={false}
              /> */}
            </LineWidget>
          </ResponsiveContainer>
        </>
      )}
    </>
  )
}
