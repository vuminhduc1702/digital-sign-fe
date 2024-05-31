import { useEffect, useRef, useState, useMemo } from 'react'
import { useSpinDelay } from 'spin-delay'
import type * as z from 'zod'

import { Spinner } from '@/components/Spinner'
import { type TimeSeries } from '../../types'
import { type widgetSchema } from '../Widget'
import refreshIcon from '@/assets/icons/table-refresh.svg'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import 'chartjs-adapter-date-fns'
import { vi } from 'date-fns/locale/vi'
import { enUS } from 'date-fns/locale/en-US'

import {
  Chart,
  // CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Chart as CustomChart } from 'react-chartjs-2'
import 'chartjs-adapter-luxon'
import StreamingPlugin from 'chartjs-plugin-streaming'
import ZoomPlugin from 'chartjs-plugin-zoom'

Chart.register(
  // CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  StreamingPlugin,
  ZoomPlugin,
)

export function LineChart({
  data,
  widgetInfo,
  refetchData,
  refreshBtn,
  widgetListRef,
}: {
  data: TimeSeries
  widgetInfo: z.infer<typeof widgetSchema>
  refetchData?: () => void
  refreshBtn?: boolean
  widgetListRef?: React.MutableRefObject<string[]>
}) {
  const { t } = useTranslation()
  const TICK_INTERVAL = widgetInfo?.config?.timewindow?.interval || 1000
  const TIME_PERIOD = widgetInfo?.config?.chartsetting?.time_period || 10000
  const START_DATE = widgetInfo?.config?.chartsetting?.start_date
  const END_DATE = widgetInfo?.config?.chartsetting?.end_date
  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    Array<Array<{ ts: number; value: string | number }>>
  >([])
  const [isRefresh, setIsRefresh] = useState<boolean>(false)

  // const yAxisName = useMemo(() => {
  //   const yAxis = widgetInfo?.attribute_config.find(
  //     item => item.axis === 'y' && item.unit,
  //   )
  //   return yAxis?.unit
  // }, [widgetInfo])

  // const y1AxisName = useMemo(() => {
  //   const yAxis = widgetInfo?.attribute_config.find(
  //     item => item.axis === 'y1' && item.unit,
  //   )
  //   return yAxis?.unit
  // }, [widgetInfo])

  // combine new data with predeous data
  useEffect(() => {
    if (
      data &&
      Object.keys(data).length > 0 &&
      widgetInfo?.config?.chartsetting?.data_type === 'HISTORY' &&
      widgetListRef?.current.includes(widgetInfo?.id)
    ) {
      prevValuesRef.current = data
      if (widgetListRef && widgetListRef?.current.includes(widgetInfo?.id)) {
        widgetListRef.current = widgetListRef.current.filter(
          item => item !== widgetInfo?.id,
        )
      }
      if (prevValuesRef.current) {
        dataManipulation()
      }
    }

    if (
      data &&
      Object.keys(data).length > 0 &&
      widgetInfo?.config?.chartsetting?.data_type !== 'HISTORY'
    ) {
      if (!prevValuesRef.current) {
        prevValuesRef.current = data
      } else {
        newValuesRef.current = data
        if (newValuesRef.current && prevValuesRef.current) {
          Object.entries(prevValuesRef.current).forEach(([key, items]) => {
            newValuesRef.current &&
              Object.entries(newValuesRef.current).forEach(
                ([newKey, newItems]) => {
                  if (
                    newKey === key &&
                    prevValuesRef.current &&
                    prevValuesRef.current[key]
                  ) {
                    prevValuesRef.current[key] = [
                      ...prevValuesRef.current[key],
                      ...newItems.filter(
                        newItem => !items.find(item => item.ts === newItem.ts),
                      ),
                    ]
                  }
                },
              )
          })
        }
      }
      if (prevValuesRef.current) {
        realtimeDataManipulation()
      }
    }
  }, [data])

  // data manipulation for static chart
  // filter data from START_DATE to END_DATE
  function dataManipulation() {
    const result: { ts: number; value: string | number }[][] = []
    Object.entries(prevValuesRef.current || []).forEach(([key, items]) => {
      const tempArr: {
        ts: number
        value: string | number
      }[] = []
      items.forEach(item => {
        const time = item.ts
        const value = parseFloat(item.value)
        if (
          (START_DATE && time < START_DATE) ||
          (END_DATE && time > END_DATE)
        ) {
          return
        } else {
          tempArr.push({
            ts: time,
            value: value,
          })
        }
      })

      tempArr.sort((a, b) => a.ts - b.ts)

      // map to the correct index in widgetInfo
      const splitKey = key.split(' - ')
      widgetInfo.attribute_config.forEach((config, index) => {
        if (
          config.attribute_key === splitKey[0] &&
          config.label === splitKey[2]
        ) {
          result[index] = tempArr
        }
      })
    })
    setDataTransformedFeedToChart(result)
  }

  // data manipulation for realtime chart
  // filter data from now - TIME_PERIOD to now
  function realtimeDataManipulation() {
    const result: { ts: number; value: string | number }[][] = []
    Object.entries(prevValuesRef.current || []).forEach(([key, items]) => {
      const tempArr: {
        ts: number
        value: string | number
      }[] = []
      items.forEach(item => {
        const now = Date.now()
        const time = item.ts
        const value = parseFloat(item.value)
        if (time < now - TIME_PERIOD) {
          return
        } else {
          tempArr.push({
            ts: time,
            value: value,
          })
        }
      })

      tempArr.sort((a, b) => a.ts - b.ts)

      // map to the correct index in widgetInfo
      const splitKey = key.split(' - ')
      widgetInfo.attribute_config.forEach((config, index) => {
        if (
          config.attribute_key === splitKey[0] &&
          config.label === splitKey[2]
        ) {
          result[index] = tempArr
        }
      })
    })
    setDataTransformedFeedToChart(result)
  }

  // refresh static chart
  function refresh() {
    setIsRefresh(true)
    widgetListRef?.current.push(widgetInfo?.id)
    refetchData?.()
    setInterval(() => {
      setIsRefresh(false)
    }, 1000)
  }

  // set chart dataset
  function getDataset() {
    if (!widgetInfo?.config) return

    if (
      widgetInfo?.config.aggregation !== 'FFT' &&
      widgetInfo?.config.aggregation !== 'SMA'
    ) {
      return widgetInfo?.attribute_config
        .map((key, index) => {
          if (dataTransformedFeedToChart[index]) {
            return {
              label: `${key?.attribute_key} ${key?.unit ? `(${key?.unit})` : ''}`,
              borderColor: key?.color,
              backgroundColor: key?.color,
              data: dataTransformedFeedToChart[index],
              borderWidth: 1,
              radius: dataTransformedFeedToChart[index]?.length <= 1 ? 2 : 0,
              yAxisID: key?.axis || 'y',
            }
          } else {
            return {
              label: `${key?.attribute_key} ${key?.unit ? `(${key?.unit})` : ''}`,
              borderColor: key?.color,
              backgroundColor: key?.color,
              data: [],
              borderWidth: 1,
              yAxisID: key?.axis || 'y',
            }
          }
        })
        .filter(value => value !== undefined)
    } else {
      return widgetInfo?.attribute_config
        .flatMap((key, index) => {
          if (
            dataTransformedFeedToChart[index] &&
            dataTransformedFeedToChart[
              dataTransformedFeedToChart.length / 2 + index
            ]
          ) {
            return [
              {
                label: `${key?.attribute_key} ${key?.unit ? `(${key?.unit})` : ''}`,
                borderColor: key?.color,
                backgroundColor: key?.color,
                data: dataTransformedFeedToChart[index],
                borderWidth: 1,
                radius: dataTransformedFeedToChart[index]?.length <= 1 ? 2 : 0,
                yAxisID: key?.axis || 'y',
              },
              {
                label: `${key?.attribute_key + ' ' + widgetInfo?.config?.aggregation} ${key?.unit ? `(${key?.unit})` : ''}`,
                borderColor:
                  key?.color === ''
                    ? 'rgba(0, 0, 0, 0.5)'
                    : key?.color?.replace(
                        /rgba\(([^)]+), [^)]+\)/,
                        'rgba($1, 0.5)',
                      ),
                backgroundColor:
                  key?.color === ''
                    ? 'rgba(0, 0, 0, 0.5)'
                    : key?.color?.replace(
                        /rgba\(([^)]+), [^)]+\)/,
                        'rgba($1, 0.5)',
                      ),
                data: dataTransformedFeedToChart[
                  dataTransformedFeedToChart.length / 2 + index
                ],
                borderWidth: 1,
                radius:
                  dataTransformedFeedToChart[
                    dataTransformedFeedToChart.length / 2 + index
                  ].length <= 1
                    ? 2
                    : 0,
                yAxisID: key?.axis || 'y',
              },
            ]
          } else {
            return [
              {
                label: `${key?.attribute_key} ${key?.unit ? `(${key?.unit})` : ''}`,
                borderColor: key?.color,
                backgroundColor: key?.color,
                data: [],
                borderWidth: 1,
                yAxisID: key?.axis || 'y',
              },
              {
                label: `${key?.attribute_key + ' ' + widgetInfo?.config?.aggregation} ${key?.unit ? `(${key?.unit})` : ''}`,
                borderColor:
                  key?.color === ''
                    ? 'rgba(0, 0, 0, 0.5)'
                    : key?.color?.replace(
                        /rgba\(([^)]+), [^)]+\)/,
                        'rgba($1, 0.5)',
                      ),
                backgroundColor:
                  key?.color === ''
                    ? 'rgba(0, 0, 0, 0.5)'
                    : key?.color?.replace(
                        /rgba\(([^)]+), [^)]+\)/,
                        'rgba($1, 0.5)',
                      ),
                data: [],
                borderWidth: 1,
                yAxisID: key?.axis || 'y',
              },
            ]
          }
        })
        .filter(value => value !== undefined)
    }
  }

  // static chart zoom options
  const zoomOptions = {
    pan: {
      enabled: true,
      mode: 'x',
    },
    zoom: {
      pinch: {
        enabled: true,
      },
      wheel: {
        enabled: true,
      },
      mode: 'x',
    },
    limits: {
      x: {
        min: START_DATE,
        max: END_DATE,
        minRange: 12000,
      },
    },
  }

  // static chart options
  const staticOption = useMemo(
    () => ({
      maintainAspectRatio: false,
      parsing: {
        xAxisKey: 'ts',
        yAxisKey: 'value',
      },
      scales: {
        x: {
          adapters: {
            date: {
              locale: i18n.language === 'vi' ? vi : enUS,
            },
          },
          time: {
            displayFormats: {
              hour: 'HH',
              minute: 'HH:mm',
              second: 'HH:mm:ss',
              milisecond: 'HH:mm:ss',
            },
          },
          type: 'time',
          title: {
            display: true,
            text: t('cloud:dashboard.time'),
            color: 'black',
          },
          ticks: {
            color: 'black',
          },
          grid: {
            borderColor: 'black',
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: t('cloud:dashboard.value'),
            color: 'black',
          },
          ticks: {
            color: 'black',
          },
          grid: {
            borderColor: 'black',
          },
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            color: 'black',
          },
          ticks: {
            color: 'black',
          },
          grid: {
            drawOnChartArea: false,
            borderColor: 'black',
          },
        },
      },
      plugins: {
        zoom: zoomOptions,
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
      elements: {
        line: {
          tension: 0.1,
        },
        point: {
          radius: 0,
          hoverRadius: 2,
        },
      },
    }),
    [i18n.language],
  )

  // realtime chart zoom options
  const realtimeZoomOptions = {
    pan: {
      enabled: true,
      mode: 'x',
    },
    zoom: {
      pinch: {
        enabled: true,
      },
      wheel: {
        enabled: true,
      },
      mode: 'x',
    },
    limits: {
      x: {
        minDelay: 0,
        minDuration: 9000,
        maxDuration: TIME_PERIOD,
        min: Date.now() - TICK_INTERVAL * 9,
      },
    },
  }

  // realtime chart options
  const realtimeOption = useMemo(
    () => ({
      maintainAspectRatio: false,
      parsing: {
        xAxisKey: 'ts',
        yAxisKey: 'value',
      },
      elements: {
        line: {
          tension: 0.1,
        },
        point: {
          radius: 3,
        },
      },
      scales: {
        x: {
          adapters: {
            date: {
              locale: i18n.language === 'vi' ? vi : enUS,
            },
          },
          time: {
            displayFormats: {
              hour: 'HH',
              minute: 'HH:mm',
              second: 'HH:mm:ss',
              milisecond: 'HH:mm:ss',
            },
          },
          type: 'realtime',
          realtime: {
            delay: 0,
            duration: TIME_PERIOD,
            refresh: TICK_INTERVAL,
            min: Date.now() - TICK_INTERVAL * 9,
            max: Date.now(),
          },
          title: {
            display: true,
            text: t('cloud:dashboard.time'),
            color: 'black',
          },
          ticks: {
            color: 'black',
          },
          grid: {
            borderColor: 'black',
          },
        },
        y: {
          position: 'left',
          title: {
            display: true,
            color: 'black',
          },
          ticks: {
            color: 'black',
          },
          grid: {
            borderColor: 'black',
          },
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            color: 'black',
          },
          ticks: {
            color: 'black',
          },
          grid: {
            drawOnChartArea: false,
            borderColor: 'black',
          },
        },
      },
      plugins: {
        zoom: realtimeZoomOptions,
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    }),
    [TIME_PERIOD, TICK_INTERVAL, i18n.language],
  )

  return (
    <>
      {widgetInfo?.config?.chartsetting.data_type === 'HISTORY' ? (
        isRefresh ? (
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
            <Line
              data={{
                datasets: getDataset(),
              }}
              options={staticOption}
              className="!h-[98%] !w-[98%] pt-8"
            />
          </>
        )
      ) : (
        <Line
          data={{
            datasets: getDataset(),
          }}
          options={realtimeOption}
          className="!h-[98%] !w-[98%] pt-8"
        />
      )}
    </>
  )
}
