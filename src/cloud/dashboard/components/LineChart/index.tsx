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
  const TICK_COUNT = 6
  const TICK_INTERVAL = widgetInfo?.config?.timewindow?.interval || 1000
  const TIME_PERIOD = widgetInfo?.config?.chartsetting?.time_period || 10000
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
                      className={`
                      color-blue-200
                    `}
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
    switch (TIME_PERIOD) {
      case 1000:
        return d3.timeFormat('%H:%M:%S')(new Date(tick))
      case 1000 * 60:
        return d3.timeFormat('%H:%M:%S')(new Date(tick))
      case 1000 * 60 * 60:
        switch (TICK_INTERVAL) {
          case 1000:
            return d3.timeFormat('%H:%M:%S')(new Date(tick))
          default:
            return d3.timeFormat('%H:%M')(new Date(tick))
        }
      case 1000 * 60 * 60 * 24:
        switch(TICK_INTERVAL) {
          case 1000: 
            return d3.timeFormat('%H:%M:%S %d')(new Date(tick))
          case 1000 * 60: 
            return d3.timeFormat('%H:%M %d')(new Date(tick))
          default: 
            return d3.timeFormat('%H:%M %d')(new Date(tick))
        }
      default:
        switch(TICK_INTERVAL) {
          case 1000: 
            return d3.timeFormat('%H:%M:%S %d/%m')(new Date(tick))
          case 1000 * 60: 
            return d3.timeFormat('%H:%M %d/%m')(new Date(tick))
          case 1000 * 60 * 60:
            return d3.timeFormat('%H:%M %d/%m')(new Date(tick))
          default: 
            return d3.timeFormat('%d/%m/%Y')(new Date(tick))
        }
    }
  }

  const initNow = new Date().getTime()
  const initStart = initNow - TIME_PERIOD
  const initEnd = initNow
  const [ticks, setTicks] = useState(
    TIME_PERIOD <= 1000
      ? [initStart, initEnd]
      : d3.range(initStart, initEnd + 1, TIME_PERIOD / TICK_COUNT),
  )
  const [realtimeData, setRealtimeData] = useState<
    Array<{ ts: number; [key: string]: string | number }>
  >([
    {
      ts: 0,
      [widgetInfo.attribute_config[0].attribute_key]: 0,
    },
  ])

  const [hasRenderedInit, setHasRenderedInit] = useState(false)

  useEffect(() => {
    if (newValuesRef.current !== null && !hasRenderedInit) {
      updateScale()
      setHasRenderedInit(true)
    }
  }, [newValuesRef.current])

  useEffect(() => {
    const interval = setInterval(() => {
      updateScale()
    }, TICK_INTERVAL)

    return () => {
      clearInterval(interval)
    }
  }, [realtimeData, newValuesRef])

  function updateScale() {
    const now = new Date().getTime()
    const start = now - TIME_PERIOD
    const end = now

    if (TIME_PERIOD <= 1000) {
      setTicks([start, end])
    } else {
      const divineTick = d3.range(start, end + 1, TIME_PERIOD / TICK_COUNT)
      for (let widget in newValuesRef.current) {
        const transformedNewValues: Array<{
          ts: number
          [key: string]: string | number
        }> = []
        newValuesRef.current[widget].map(item => {
          if (item.ts > start && item.ts < end) {
            const returnValue = {
              ts: item.ts,
              [widget]: parseFloat(item.value),
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
              <LineWidget data={dataTransformedFeedToChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ts" allowDuplicatedCategory={false} />
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
            <LineWidget data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="ts"
                scale="time"
                type="number"
                domain={[ticks[0], ticks[ticks.length - 1]]}
                ticks={ticks}
                tickCount={TIME_PERIOD <= 1000 ? 2 : TICK_COUNT}
                tickFormatter={timeFormatter}
                allowDuplicatedCategory={false}
                allowDataOverflow={true}
              />
              <YAxis />
              <Tooltip content={renderTooltip} />
              <Legend content={renderLegend} />
              {/* <Brush
                dataKey="ts"
                height={30}
                stroke="#8884d8"
                tickFormatter={timeFormatter}
              /> */}
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
            <LineWidget data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="ts"
                scale="time"
                type="number"
                domain={[ticks[0], ticks[ticks.length - 1]]}
                ticks={ticks}
                tickCount={TIME_PERIOD <= 1000 ? 2 : TICK_COUNT}
                tickFormatter={timeFormatter}
                allowDuplicatedCategory={true}
                allowDataOverflow={true}
              />
              <YAxis />
              <Tooltip content={renderTooltip} />
              <Legend content={renderLegend} />
              {/* <Brush
                dataKey="ts"
                height={30}
                stroke="#8884d8"
                tickFormatter={timeFormatter}
              /> */}
              <Line
                connectNulls
                type="monotone"
                dataKey={widgetInfo.attribute_config[0].attribute_key}
                animationDuration={250}
                activeDot={{ r: 5 }}
                dot={false}
              />
            </LineWidget>
          </ResponsiveContainer>
        </>
      )}
    </>
  )
}
