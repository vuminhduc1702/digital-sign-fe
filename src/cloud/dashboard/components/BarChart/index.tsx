import { useEffect, useRef, useState } from 'react'
import { useSpinDelay } from 'spin-delay'
import type * as z from 'zod'

import { Spinner } from '@/components/Spinner'
import { type TimeSeries } from '../../types'
import { type widgetSchema } from '../Widget'
import refreshIcon from '@/assets/icons/table-refresh.svg'
import * as d3 from 'd3'

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
}: {
  data: TimeSeries
  widgetInfo: z.infer<typeof widgetSchema>
  refetchData?: () => void
  refreshBtn?: boolean
}) => {
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
            backgroundColor: key?.color.replace(/[^,]+(?=\))/, '0.2'),
            data: dataTransformedFeedToChart[index],
          }
        } else {
          return {
            label: key?.deviceName,
            borderColor: key?.color,
            backgroundColor: key?.color.replace(/[^,]+(?=\))/, '0.2'),
            data: [],
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
      // },
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
          options={{
            barPercentage: 0.5,
            maintainAspectRatio: false,
            responsive: true,
            parsing: {
              xAxisKey: 'ts',
              yAxisKey: 'value',
            },
            elements: {
              line: {
                tension: 0.5,
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
                    chart.data.datasets.forEach(dataset => {
                      // if (dataset.data) {
                      //   dataset.data = dataset.data.filter(
                      //     data => data?.ts >= now - TIME_PERIOD,
                      //   )
                      // }
                    })
                  },
                },
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
      )}
    </>
  )
}
