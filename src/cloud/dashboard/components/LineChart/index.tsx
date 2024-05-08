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

import { Spinner } from '@/components/Spinner'
import { type TimeSeries } from '../../types'
import { type widgetSchema } from '../Widget'
import refreshIcon from '@/assets/icons/table-refresh.svg'

import * as d3 from 'd3'
import i18n from '@/i18n'

export const VN_TIME = {
  dateTime: '%d %B %Y',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ],
  shortDays: [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ],
  months: [
    'Tháng Một',
    'Tháng Hai',
    'Tháng Ba',
    'Tháng Tư',
    'Tháng Năm',
    'Tháng Sáu',
    'Tháng Bảy',
    'Tháng Tám',
    'Tháng Chín',
    'Tháng Mười',
    'Tháng Mười Một',
    'Tháng Mười Hai',
  ],
  shortMonths: [
    'T.Một',
    'T.Hai',
    'T.Ba',
    'T.Tư',
    'T.Năm',
    'T.Sáu',
    'T.Bảy',
    'T.Tám',
    'T.Chín',
    'T.Mười',
    'T.Mười Một',
    'T.Mười Hai',
  ],
}

export const EN_TIME = {
  dateTime: '%x, %X',
  date: '%-m/%-d/%Y',
  time: '%-I:%M:%S %p',
  periods: ['AM', 'PM'] as [string, string],
  days: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  shortMonths: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
}

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
  const TICK_COUNT = 5
  const TICK_INTERVAL = widgetInfo?.config?.timewindow?.interval || 1000
  const TIME_PERIOD =
    widgetInfo?.config?.chartsetting?.time_period ||
    (widgetInfo?.config?.chartsetting?.end_date &&
    widgetInfo?.config?.chartsetting?.start_date
      ? widgetInfo.config.chartsetting.end_date -
        widgetInfo.config.chartsetting.start_date
      : 10000)
  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    Array<{ ts: number; [key: string]: string | number }>
  >([
    {
      ts: 0,
    },
  ])
  const [isRefresh, setIsRefresh] = useState<boolean>(false)

  console.log(data)

  useEffect(() => {
    if (i18n.language === 'vi') {
      d3.timeFormatDefaultLocale(VN_TIME)
    } else {
      d3.timeFormatDefaultLocale(EN_TIME)
    }
  }, [i18n.language])

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
      ts: number
      [key: string]: string | number
    }> = lineWidgetDataType.map(item => {
      return {
        ...item,
        ts: item.ts,
      }
    })
    setDataTransformedFeedToChart(lineWidgetDataTypeToChart)
  }

  const showSpinner = useSpinDelay(dataTransformedFeedToChart[0].ts === 0, {
    delay: 0,
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
                obj =>
                  obj.attribute_key +
                    ' - ' +
                    obj.deviceName +
                    ' - ' +
                    obj.label ===
                  entry.dataKey,
              )
              if (entry.payload.ts !== 0) {
                return (
                  <div
                    key={`item-${index}`}
                    className="m-[3px] flex flex-col justify-between border border-gray-300 bg-white p-[10px]"
                  >
                    <div>{timeFormatterTooltip(entry.payload.ts)}</div>
                    <div style={{ color: entry.color }}>
                      {unitConfig &&
                      unitConfig.length > 0 &&
                      unitConfig[0].unit !== ''
                        ? unitConfig[0].deviceName +
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
            obj =>
              obj.attribute_key + ' - ' + obj.deviceName + ' - ' + obj.label ===
              entry.dataKey,
          )
          const display =
            unitConfig[0].attribute_key +
            (unitConfig[0].deviceName ? ' - ' + unitConfig[0].deviceName : '')
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
                ? display + ' (' + unitConfig[0].unit + ')'
                : display}
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

  function timeFormatter(tick: number) {
    switch (true) {
      case TIME_PERIOD <= 1000 * 60 * 60 * 12:
        switch (true) {
          case TICK_INTERVAL <= 1000 * 30:
            return d3.timeFormat('%H:%M:%S')(new Date(tick))
          default:
            return d3.timeFormat('%H:%M')(new Date(tick))
        }
      case TIME_PERIOD > 1000 * 60 * 60 * 12 &&
        TIME_PERIOD <= 1000 * 60 * 60 * 24 * 7:
        switch (true) {
          case TICK_INTERVAL <= 1000 * 60 * 30:
            return d3.timeFormat('%H:%M - %-d/%-m')(new Date(tick))
          default:
            return d3.timeFormat('%-I %p - %-d/%-m')(new Date(tick))
        }
      default:
        return d3.timeFormat('%-d %B')(new Date(tick))
    }
  }

  function timeFormatterTooltip(tick: number) {
    return d3.timeFormat('%H:%M:%S - %-d %B, %Y')(new Date(tick))
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
      [widgetInfo.attribute_config[0].attribute_key +
      ' - ' +
      widgetInfo.attribute_config[0].deviceName +
      ' - ' +
      widgetInfo.attribute_config[0].label]: 0,
    },
  ])

  useEffect(() => {
    if (widgetInfo?.config?.chartsetting.data_type === 'HISTORY') {
      return
    }
    updateScale()
  }, [widgetInfo])

  useEffect(() => {
    if (widgetInfo?.config?.chartsetting.data_type === 'HISTORY') {
      return
    }
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
      const widgetArray: Array<{ ts: number; [key: string]: string | number }> =
        []

      const transformedNewValues: {
        ts: number
        [key: string]: string | number
      }[] = []

      for (let widget in newValuesRef.current) {
        newValuesRef.current[widget].map(item => {
          const timeStamp = Math.floor(item.ts / 1000) * 1000
          if (item.ts > start && item.ts < end) {
            const returnValue = {
              ts: timeStamp,
              [widget]: parseFloat(item.value),
            }
            const existingIndex = transformedNewValues.findIndex(
              obj => obj.ts === timeStamp,
            )
            if (existingIndex === -1) {
              transformedNewValues.push(returnValue)
            } else {
              transformedNewValues[existingIndex][widget] = parseFloat(
                item.value,
              )
            }
          }
        })
      }
      if (transformedNewValues.length > 0) {
        widgetArray.push(...transformedNewValues)
      } else {
        widgetArray.push({
          ts: 0,
          [widgetInfo.attribute_config[0].attribute_key +
          ' - ' +
          widgetInfo.attribute_config[0].deviceName +
          ' - ' +
          widgetInfo.attribute_config[0].label]: 0,
        })
      }
      setRealtimeData(widgetArray)
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
                <XAxis
                  dataKey="ts"
                  allowDuplicatedCategory={false}
                  tickFormatter={timeFormatter}
                />
                <YAxis />
                <Tooltip content={renderTooltip} />
                <Legend content={renderLegend} />
                <Brush
                  dataKey="ts"
                  height={30}
                  stroke="#8884d8"
                  tickFormatter={timeFormatter}
                />
                {widgetInfo.attribute_config.map((key, index) => {
                  const attributeKey =
                    key.attribute_key +
                    ' - ' +
                    key.deviceName +
                    ' - ' +
                    key.label
                  const colorKey = key.color

                  return (
                    <Line
                      key={index.toString()}
                      connectNulls
                      type="monotone"
                      dataKey={attributeKey}
                      animationDuration={250}
                      activeDot={{ r: 5 }}
                      dot={false}
                      stroke={
                        attributeKey.includes('SMA') ||
                        attributeKey.includes('FFT')
                          ? '#2c2c2c'
                          : colorKey && colorKey !== ''
                            ? colorKey
                            : '#e8c1a0'
                      }
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
              {widgetInfo.attribute_config.map((key, index) => {
                const attributeKey =
                  key?.attribute_key +
                  ' - ' +
                  key?.deviceName +
                  ' - ' +
                  key?.label
                const colorKey = key?.color

                return (
                  <Line
                    key={index.toString()}
                    connectNulls
                    type="monotone"
                    dataKey={attributeKey}
                    animationDuration={250}
                    activeDot={{ r: 5 }}
                    dot={false}
                    stroke={
                      attributeKey.includes('SMA') ||
                      attributeKey.includes('FFT')
                        ? '#2c2c2c'
                        : colorKey && colorKey !== ''
                          ? colorKey
                          : '#e8c1a0'
                    }
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
              {widgetInfo.attribute_config.map((key, index) => {
                const attributeKey =
                  key.attribute_key + ' - ' + key.deviceName + ' - ' + key.label
                const colorKey = key.color

                return (
                  <Line
                    key={index.toString()}
                    connectNulls
                    type="monotone"
                    dataKey={attributeKey}
                    animationDuration={250}
                    activeDot={{ r: 5 }}
                    dot={false}
                    stroke={
                      attributeKey.includes('SMA') ||
                      attributeKey.includes('FFT')
                        ? '#2c2c2c'
                        : colorKey && colorKey !== ''
                          ? colorKey
                          : '#e8c1a0'
                    }
                  />
                )
              })}
            </LineWidget>
          </ResponsiveContainer>
        </>
      )}
    </>
  )
}
