import { useEffect, useRef, useState } from 'react'
import { type BarDatum, ResponsiveBar } from '@nivo/bar'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '~/components/Spinner'
import { defaultDateConfig, getVNDateFormat } from '~/utils/misc'

import { type TimeSeries } from '../../types'

export const BarChart = ({ data }: { data: TimeSeries }) => {
  console.log('new bar: ', data)
  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    BarDatum[]
  >([
    {
      time: 0,
    },
  ])

  // Handle real time value
  const newDataValue = data?.[Object.keys(data)?.[0]]?.[0].value ?? ''
  useEffect(() => {
    if (data != null && Object.keys(data).length !== 0) {
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
    const barWidgetDataType = Object.entries(newValuesRef.current as TimeSeries)
      .reduce((result: BarDatum[], [key, items]) => {
        items
          .toSorted((a, b) => a.ts - b.ts)
          .forEach(item => {
            const time = dateTransformation(item.ts)
            const value = parseInt(item.value)
            const existingIndex = result.findIndex(obj => obj.time === time)
            if (existingIndex === -1) {
              result.push({ time, [key]: value })
            } else {
              result[existingIndex][key] = value
            }
          })

        return result
      }, [])
      .slice(-10)

    setDataTransformedFeedToChart(barWidgetDataType)
  }

  function dateTransformation(date: number) {
    const { year, month, day, ...dateTimeOptionsWithoutYearMonthDay } =
      defaultDateConfig
    return getVNDateFormat({
      date: date,
      config: {
        ...dateTimeOptionsWithoutYearMonthDay,
        second: '2-digit',
      },
    })
  }

  const showSpinner = useSpinDelay(dataTransformedFeedToChart.length === 0, {
    delay: 150,
    minDuration: 300,
  })

  console.log('dataTransformedFeedToChart', dataTransformedFeedToChart)

  return (
    <>
      {dataTransformedFeedToChart.length > 0 ? (
        <ResponsiveBar
          data={dataTransformedFeedToChart}
          keys={Object.keys(data)}
          indexBy="time"
          colors={[
            'hsl(308, 70%, 50%)',
            'hsl(80, 70%, 50%)',
            'hsl(12, 70%, 50%)',
          ]}
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 1.6]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Thời gian',
            legendPosition: 'middle',
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Giá trị',
            legendPosition: 'middle',
            legendOffset: -40,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.6]],
          }}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          role="application"
          ariaLabel="Bar chart"
          barAriaLabel={e =>
            e.id + ': ' + e.formattedValue + ' in device: ' + e.indexValue
          }
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      )}
    </>
  )
}
