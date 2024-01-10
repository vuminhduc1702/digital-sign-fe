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

import * as d3 from 'd3'

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
  const TICK_COUNT = 7
  const TICK_INTERVAL = widgetInfo?.config?.timewindow?.interval || 10000
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

  const renderTooltip = (props: any) => {
    const { payload } = props
    return (
      <div>
        {payload?.length === 0 ? null : (
          <>
            {payload?.map((entry: any, index: number) => {
              const unitConfig = widgetInfo.attribute_config.filter(
                obj => obj.attribute_key === entry.dataKey,
              )
              if (entry.payload.ts !== 0) {
                return (
                  <div
                    key={`item-${index}`}
                    className="m-[3px] flex flex-col justify-between border border-gray-300 bg-white p-[10px]"
                  >
                    <div>{timeFormatter(entry.payload.ts)}</div>
                    <div
                      style={{ color: entry.color ? entry.color : 'inherit' }}
                    >
                      {unitConfig &&
                      unitConfig.length > 0 &&
                      unitConfig[0].unit !== ''
                        ? unitConfig[0].attribute_key +
                          ': ' +
                          entry.value +
                          ' (' +
                          unitConfig[0].unit +
                          ')'
                        : entry.value}
                    </div>
                  </div>
                )
              }
            })}
          </>
        )}
      </div>
    )
  }

  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="pt-3 text-center">
        {payload?.reverse().map((entry: any, index: number) => {
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

  function timeFormatter(tick: any | null) {
    if (TICK_INTERVAL <= 1000 * 60 * 60) {
      return d3.timeFormat('%H:%M:%S')(new Date(tick))
    } else if (
      60000 * 60 <= TICK_INTERVAL &&
      TICK_INTERVAL <= 1000 * 60 * 60 * 24
    ) {
      return d3.timeFormat('%H:%M %d')(new Date(tick))
    } else {
      return d3.timeFormat('%d/%m/%y')(new Date(tick))
    }
  }

  const initStart = new Date().getTime() - TICK_COUNT * TICK_INTERVAL
  const initEnd = new Date().getTime()
  const [ticks, setTicks] = useState(
    d3.range(initStart, initEnd, TICK_INTERVAL),
  )
  const [realtimeData, setRealtimeData] = useState<
    Array<{ ts: number; [key: string]: string | number }>
  >([
    {
      ts: 0,
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      updateScale()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [realtimeData, newValuesRef])

  function updateScale() {
    const now = new Date()
    const start = now.getTime() - TICK_COUNT * TICK_INTERVAL
    const end = now.getTime()
    const divineTick = d3.range(start, end, TICK_INTERVAL)

    for (let widget in newValuesRef.current) {
      const transformedNewValues: Array<{
        ts: number
        [key: string]: string | number
      }> = []
      newValuesRef.current[widget].map(item => {
        if (item.ts > start && item.ts < ticks[ticks.length - 1]) {
          const returnValue = {
            ts: item.ts,
            [widget]: parseFloat(item.value),
            date: dateTransformation(item.ts),
          }
          transformedNewValues.push(returnValue)
        }
      })
      if (transformedNewValues.length > 0) {
        setRealtimeData(transformedNewValues)
      } else {
        setRealtimeData([
          {
            ts: 0,
            [widget]: 0,
          },
        ])
      }
    }
    setTicks(divineTick)
  }

  return (
    <>
      {refreshBtn && (
        <div
          className="absolute left-[10px] top-[50px] z-20 cursor-pointer"
          onClick={refresh}
        >
          <img src={refreshIcon} alt="" />
        </div>
      )}
      {widgetInfo?.config?.chartsetting.data_type === 'HISTORY' ? (
        !showSpinner && newValuesRef.current != null && !isRefresh ? (
          <>
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
        )
      ) : !showSpinner && newValuesRef.current != null ? (
        <>
          <ResponsiveContainer width="98%" height="90%" className="pt-8">
            <BarReChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="ts"
                scale="time"
                type="number"
                domain={[ticks[0], ticks[ticks.length - 1]]}
                ticks={ticks}
                tickCount={TICK_COUNT}
                tickFormatter={timeFormatter}
                allowDuplicatedCategory={true}
                allowDataOverflow={true}
              />
              <YAxis />
              <Tooltip
                content={renderTooltip}
                cursor={{ fill: 'transparent' }}
              />
              <Legend content={renderLegend} />
              {/* <Brush
                dataKey="time"
                height={30}
                stroke="#8884d8"
                tickFormatter={timeFormatter}
              /> */}
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
        <>
          <ResponsiveContainer width="98%" height="90%" className="pt-8">
            <BarReChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="ts"
                scale="time"
                type="number"
                domain={[ticks[0], ticks[ticks.length - 1]]}
                ticks={ticks}
                tickCount={TICK_COUNT}
                tickFormatter={timeFormatter}
                allowDuplicatedCategory={true}
                allowDataOverflow={true}
              />
              <YAxis />
              <Tooltip />
              <Legend content={renderLegend} />
              {/* <Brush
                dataKey="time"
                height={30}
                stroke="#8884d8"
                tickFormatter={timeFormatter}
              /> */}
            </BarReChart>
          </ResponsiveContainer>
        </>
      )}
    </>
  )
}
