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

import { type DataItem, type TimeSeries } from '../../types'
import { type widgetSchema } from '../Widget'
import { type WidgetAttrDeviceType } from '../../routes/DashboardDetail'

export const BarChart = ({
  data,
  widgetInfo,
}: {
  data: TimeSeries
  widgetInfo?: z.infer<typeof widgetSchema>
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

  const newDataValue = data?.[Object.keys(data)?.[0]]?.[0].value ?? ''
  useEffect(() => {
    if (Object.keys(data).length !== 0) {
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

        return result.sort((a, b) => (a.time as number) - (b.time as number))
      },
      [],
    )

    setDataTransformedFeedToChart(
      barWidgetDataType.map(item => {
        return {
          ...item,
          time: dateTransformation(item.time as number),
        }
      }),
    )
  }

  function dateTransformation(date: number) {
    const { year, month, day, ...dateTimeOptionsWithoutYearMonthDay } =
      defaultDateConfig

    return getVNDateFormat({
      date,
      config: {
        ...dateTimeOptionsWithoutYearMonthDay,
        second: '2-digit',
        // fractionalSecondDigits: 3,
      },
    })
  }

  const showSpinner = useSpinDelay(dataTransformedFeedToChart.length === 0, {
    delay: 150,
    minDuration: 300,
  })

  // console.log('transform bar', dataTransformedFeedToChart)

  return (
    <>
      {dataTransformedFeedToChart.length > 0 && newValuesRef.current != null ? (
        <ResponsiveContainer width="98%" height="90%" className="pt-8">
          <BarReChart data={dataTransformedFeedToChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Brush dataKey="time" height={30} stroke="#8884d8" />
            {Object.keys(newValuesRef.current).map((key, index) => {
              return (
                <Bar
                  key={index.toString()}
                  dataKey={key}
                  animationDuration={250}
                  barSize={10}
                  stroke={
                    index === 0
                      ? '#e8c1a0'
                      : index === 1
                      ? '#f47560'
                      : '#f1e15b'
                  }
                  fill={
                    index === 0
                      ? '#e8c1a0'
                      : index === 1
                      ? '#f47560'
                      : '#f1e15b'
                  }
                />
              )
            })}
            {/* stackId="a" */}
          </BarReChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      )}
    </>
  )
}
