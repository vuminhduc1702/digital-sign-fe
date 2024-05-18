import { useEffect, useRef, useState } from 'react'
import { useSpinDelay } from 'spin-delay'
import type * as z from 'zod'

import { Spinner } from '@/components/Spinner'
import { type TimeSeries } from '../../types'
import { type widgetSchema } from '../Widget'
import refreshIcon from '@/assets/icons/table-refresh.svg'

import * as d3 from 'd3'
import { useTranslation } from 'react-i18next'

import {
  Chart,
  CategoryScale,
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
  CategoryScale,
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
}: {
  data: TimeSeries
  widgetInfo: z.infer<typeof widgetSchema>
  refetchData?: () => void
  refreshBtn?: boolean
}) {
  const { t } = useTranslation()
  const TICK_INTERVAL = widgetInfo?.config?.timewindow?.interval || 1000
  const TIME_PERIOD = widgetInfo?.config?.chartsetting?.time_period || 10000
  const START_DATE = widgetInfo?.config?.chartsetting?.start_date
  const END_DATE = widgetInfo?.config?.chartsetting?.end_date
  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)
  // 0 - init fetch
  // 1 - init fetch complete
  // 2 - refetch
  const fetchDataMode = useRef<0 | 1 | 2>(0)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    Array<Array<{ ts: number; value: string | number }>>
  >([])
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
    if (
      data &&
      Object.keys(data).length > 0 &&
      (fetchDataMode.current === 0 || fetchDataMode.current === 2)
    ) {
      if (prevValuesRef.current === null) {
        prevValuesRef.current = data
      } else {
        newValuesRef.current = data
        if (newValuesRef.current && prevValuesRef.current) {
          Object.entries(prevValuesRef.current).forEach(([key, items]) => {
            Object.entries(newValuesRef.current).forEach(
              ([newKey, newItems]) => {
                if (newKey === key) {
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
      if (
        prevValuesRef.current &&
        widgetInfo?.config?.chartsetting?.data_type === 'REALTIME'
      ) {
        realtimeDataManipulation()
      } else if (
        prevValuesRef.current &&
        widgetInfo?.config?.chartsetting?.data_type === 'HISTORY'
      ) {
        dataManipulation()

        // complete init fetch
        fetchDataMode.current = 1
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
      result.push(tempArr)
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
      result.push(tempArr)
    })
    setDataTransformedFeedToChart(result)
  }

  // refresh static chart
  function refresh() {
    setIsRefresh(true)
    refetchData?.()
    fetchDataMode.current = 2
    setInterval(() => {
      setIsRefresh(false)
    }, 1000)
  }

  // set chart dataset
  function getDataset() {
    return widgetInfo?.attribute_config
      .map((key, index) => {
        if (dataTransformedFeedToChart[index]) {
          return {
            label: key?.attribute_key,
            borderColor: key?.color,
            backgroundColor: key?.color,
            data: dataTransformedFeedToChart[index],
            borderWidth: 1,
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
      // drag: {
      //   enabled: true,
      // }
    },
    limits: {
      x: {
        minDuration: 5000,
        maxDuration: TIME_PERIOD,
      },
    },
  }

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
              options={{
                maintainAspectRatio: false,
                responsive: true,
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
                  point: {
                    radius: 0,
                    hoverRadius: 2,
                  },
                },
              }}
              className="!h-[98%] !w-[98%] pt-8"
            />
          </>
        )
      ) : (
        <Line
          data={{
            datasets: getDataset(),
          }}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            parsing: {
              xAxisKey: 'ts',
              yAxisKey: 'value',
            },
            elements: {
              point: {
                radius: 0,
              },
            },
            scales: {
              x: {
                type: 'realtime',
                realtime: {
                  delay: 0,
                  duration: TIME_PERIOD,
                  refresh: TICK_INTERVAL,
                  onRefresh: chart => {
                    const now = Date.now()
                    chart.data.datasets.forEach(dataset => {})
                  },
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
            },
            plugins: {
              zoom: zoomOptions,
            },
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false,
            },
          }}
          className="!h-[98%] !w-[98%] pt-8"
        />
      )}
    </>
  )
}
