import { useEffect, useRef, useState } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '~/components/Spinner'
import { defaultDateConfig, getVNDateFormat } from '~/utils/misc'

import { type Datum, ResponsiveLine, type Serie } from '@nivo/line'
import { type TimeSeries, type WSWidgetData } from '../../types'

export function LineChart({ data }: { data: TimeSeries }) {
  console.log('new', data)
  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    Serie[]
  >([
    {
      id: '',
      color: 'hsl(106, 70%, 50%)',
      data: [],
    },
  ])

  // Handle real time value
  const newDataValue = data?.[Object.keys(data)?.[0]]?.[0].value ?? ''
  useEffect(() => {
    if (data != null && Object.keys(data).length !== 0) {
      prevValuesRef.current = newValuesRef.current || data
      if (newValuesRef.current != null) {
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
    const lineWidgetDataType: Serie[] = Object.entries(
      newValuesRef.current as TimeSeries,
    ).map(([id, item], index) => ({
      id,
      color: 'hsl(106, 70%, 50%)',
      data: dataTransformation(item),
    }))
    setDataTransformedFeedToChart(
      lineWidgetDataType.map(item => ({
        ...item,
        data: item.data.filter(subItem => subItem.y !== null),
      })),
    )
  }

  function dataTransformation(data: WSWidgetData[]): Datum[] {
    const { year, month, day, ...dateTimeOptionsWithoutYearMonthDay } =
      defaultDateConfig
    return data
      ?.toSorted((a, b) => a.ts - b.ts)
      ?.map(({ ts, value }: WSWidgetData) => ({
        x: getVNDateFormat({
          date: ts,
          config: {
            ...dateTimeOptionsWithoutYearMonthDay,
            second: '2-digit',
          },
        }),
        y: parseFloat(value),
      }))
      .slice(-10)
  }

  const showSpinner = useSpinDelay(
    dataTransformedFeedToChart[0].data.length === 0,
    {
      delay: 150,
      minDuration: 300,
    },
  )

  return (
    <>
      {dataTransformedFeedToChart[0].data.length > 0 ? (
        <ResponsiveLine
          data={dataTransformedFeedToChart}
          margin={{ top: 50, right: 30, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.2f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Thời gian',
            legendOffset: 36,
            legendPosition: 'middle',
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Giá trị',
            legendOffset: -40,
            legendPosition: 'middle',
          }}
          pointSize={10}
          useMesh={true}
          enableSlices="x"
          legends={[
            {
              anchor: 'top',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: -30,
              itemsSpacing: 50,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      )}
    </>
  )
}
