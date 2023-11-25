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

export function LineChart({
  data,
  widgetInfo,
}: {
  data: TimeSeries
  widgetInfo?: z.infer<typeof widgetSchema>
}) {
  // console.log(`new line: `, data)
  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    Array<{ ts: string; [key: string]: string | number }>
  >([
    {
      ts: '',
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
  }, [newDataValue])

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

  const [widgetInfoToChart, setWidgetInfoToChart] = useState<z.infer<
    typeof widgetSchema
  > | null>()
  useEffect(() => {
    if (widgetInfo != null) {
      setWidgetInfoToChart(widgetInfo)
    }
  }, [widgetInfo])

  const showSpinner = useSpinDelay(dataTransformedFeedToChart.length === 0, {
    delay: 150,
    minDuration: 300,
  })

  // console.log('transform line', dataTransformedFeedToChart)

  return (
    <>
      {dataTransformedFeedToChart.length > 0 && newValuesRef.current != null ? (
        <ResponsiveContainer width="98%" height="90%" className="pt-8">
          <LineWidget data={dataTransformedFeedToChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ts" allowDuplicatedCategory={false} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Brush dataKey="ts" height={30} stroke="#8884d8" />
            {Object.keys(newValuesRef.current).map((key, index) => {
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
                      : index === 0
                      ? '#e8c1a0'
                      : index === 1
                      ? '#f47560'
                      : '#f1e15b'
                  }
                  fill={
                    key.includes('SMA') || key.includes('FFT')
                      ? '#2c2c2c'
                      : index === 0
                      ? '#e8c1a0'
                      : index === 1
                      ? '#f47560'
                      : '#f1e15b'
                  }
                />
              )
            })}
          </LineWidget>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      )}
    </>
  )
}
