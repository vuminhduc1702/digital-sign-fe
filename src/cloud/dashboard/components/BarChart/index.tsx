import { useEffect, useRef, useState, useMemo } from 'react'
import { useSpinDelay } from 'spin-delay'
import type * as z from 'zod'

import { Spinner } from '@/components/Spinner'
import { type TimeSeries } from '../../types'
import { type widgetSchema } from '../Widget'
import refreshIcon from '@/assets/icons/table-refresh.svg'

import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js'
import { Bar, Chart as CustomChart } from 'react-chartjs-2'
import 'chartjs-adapter-luxon'
import StreamingPlugin from 'chartjs-plugin-streaming'
import zoomPlugin from 'chartjs-plugin-zoom'
import { useTranslation } from 'react-i18next'

Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  StreamingPlugin,
  zoomPlugin,
)

export const BarChart = ({
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
}) => {
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
  const [dataNameList, setDataNameList] = useState<string[]>([])
  const [isRefresh, setIsRefresh] = useState<boolean>(false)

  // useEffect(() => {
  //   if (i18n.language === 'vi') {
  //     d3.timeFormatDefaultLocale(VN_TIME)
  //   } else {
  //     d3.timeFormatDefaultLocale(EN_TIME)
  //   }
  // }, [i18n.language])

  // combine new data with previous data
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      if (
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

      if (widgetInfo?.config?.chartsetting?.data_type === 'REALTIME') {
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
                      prevValuesRef?.current[key]
                    ) {
                      prevValuesRef.current[key] = [
                        ...prevValuesRef.current[key],
                        ...newItems.filter(
                          newItem =>
                            !items.find(item => item.ts === newItem.ts),
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
    }
  }, [data])

  // data manipulation for static chart
  function dataManipulation() {
    const result: { ts: number; value: string | number }[][] = []
    const keyResult: string[] = []
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
      result.push(tempArr)
    })
    setDataTransformedFeedToChart(result)
    setDataNameList(keyResult)
  }

  // data manipulation for realtime chart
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
      result.push(tempArr)
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
              label: key?.attribute_key,
              borderColor: key?.color,
              backgroundColor: key?.color,
              data: dataTransformedFeedToChart[index],
              borderWidth: 1,
              yAxisId: 'y',
            }
          } else {
            return {
              label: key?.attribute_key,
              borderColor: key?.color,
              backgroundColor: key?.color,
              data: [],
              borderWidth: 1,
            }
          }
        })
        .filter(value => value !== undefined)
    } else {
      return widgetInfo?.attribute_config
        .flatMap((key, index) => {
          if (
            dataNameList.filter(item => {
              return item.includes(key?.label)
            }) &&
            dataTransformedFeedToChart[index] &&
            dataTransformedFeedToChart[
              dataTransformedFeedToChart.length / 2 + index
            ]
          ) {
            return [
              {
                label: key?.attribute_key,
                borderColor: key?.color,
                backgroundColor: key?.color,
                data: dataTransformedFeedToChart[index],
                borderWidth: 1,
              },
              {
                label:
                  key?.attribute_key + ' ' + widgetInfo?.config.aggregation,
                borderColor:
                  key?.color === ''
                    ? 'rgba(0, 0, 0, 0.5)'
                    : key?.color.replace(
                        /rgba\(([^)]+), [^)]+\)/,
                        'rgba($1, 0.5)',
                      ),
                backgroundColor:
                  key?.color === ''
                    ? 'rgba(0, 0, 0, 0.5)'
                    : key?.color.replace(
                        /rgba\(([^)]+), [^)]+\)/,
                        'rgba($1, 0.5)',
                      ),
                data: dataTransformedFeedToChart[
                  dataTransformedFeedToChart.length / 2 + index
                ],
                borderWidth: 1,
              },
            ]
          } else {
            return [
              {
                label: key?.attribute_key,
                borderColor: key?.color,
                backgroundColor: key?.color,
                data: [],
                borderWidth: 1,
              },
              {
                label:
                  key?.attribute_key + ' ' + widgetInfo?.config.aggregation,
                borderColor:
                  key?.color === ''
                    ? 'rgba(0, 0, 0, 0.5)'
                    : key?.color.replace(
                        /rgba\(([^)]+), [^)]+\)/,
                        'rgba($1, 0.5)',
                      ),
                backgroundColor:
                  key?.color === ''
                    ? 'rgba(0, 0, 0, 0.5)'
                    : key?.color.replace(
                        /rgba\(([^)]+), [^)]+\)/,
                        'rgba($1, 0.5)',
                      ),
                data: [],
                borderWidth: 1,
              },
            ]
          }
        })
        .filter(value => value !== undefined)
    }
  }

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
        min: START_DATE || Date.now() - TIME_PERIOD,
      },
    },
  }

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
        // y1: {
        //   type: 'linear',
        //   position: 'right',
        //   ticks: {
        //     max: 100,
        //     min: 0,
        //     callback: function (value) {
        //       return `${value * 100}%`
        //       // const percentage = (value / maxDataFeedToChart.current) * 10000
        //       // return `${percentage.toFixed(2)}%`
        //     },
        //     color: 'black',
        //   },
        //   grid: {
        //     drawOnChartArea: false,
        //     borderColor: 'black',
        //   },
        // },
      },
      plugins: {
        zoom: realtimeZoomOptions,
        beforeDraw: function (chart) {
          chart.options.scales.x.realtime.duration = TICK_INTERVAL * 9
          chart.update()
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    }),
    [TIME_PERIOD, TICK_INTERVAL],
  )

  return (
    <>
      {isRefresh ? (
        <div className="flex h-full items-center justify-center">
          <Spinner size="xl" />
        </div>
      ) : widgetInfo?.config?.chartsetting.data_type === 'HISTORY' ? (
        <>
          {refreshBtn && (
            <div
              className="absolute right-[95px] top-[10px] z-20 cursor-pointer"
              onClick={refresh}
            >
              <img src={refreshIcon} alt="" />
            </div>
          )}
          <Bar
            data={{
              datasets: getDataset(),
            }}
            options={{
              barPercentage: 0.5,
              maintainAspectRatio: false,
              parsing: {
                xAxisKey: 'ts',
                yAxisKey: 'value',
              },
              scales: {
                x: {
                  type: 'time',
                  title: {
                    display: true,
                    text: t('cloud:dashboard.time'),
                  },
                  ticks: {
                    color: 'black',
                  },
                  grid: {
                    borderColor: 'black',
                  },
                  min: START_DATE || 0,
                  max: END_DATE || Date.now(),
                },
                y: {
                  title: {
                    display: true,
                    text: t('cloud:dashboard.value'),
                  },
                  ticks: {
                    color: 'black',
                  },
                  grid: {
                    borderColor: 'black',
                  },
                },
                // y1: {
                //   type: 'linear',
                //   position: 'right',
                //   ticks: {
                //     max: 100,
                //     min: 0,
                //     callback: function (value) {
                //       return `${value * 100}%`
                //       // const percentage = (value / maxDataFeedToChart.current) * 10000
                //       // return `${percentage.toFixed(2)}%`
                //     },
                //     color: 'black',
                //   },
                //   grid: {
                //     drawOnChartArea: false,
                //     borderColor: 'black',
                //   },
                // },
              },
              plugins: {
                zoom: zoomOptions,
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false,
              },
              barThickness: 15,
            }}
            className="!h-[98%] !w-[98%] pt-8"
          />
        </>
      ) : (
        <Bar
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
