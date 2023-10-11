import { type Datum, ResponsiveLine, type Serie } from '@nivo/line'

import { defaultDateConfig, getVNDateFormat } from '~/utils/misc'

import { type TimeSeries, type WSWidgetData } from '../../types'
import { useRef } from 'react'

export function LineChart({ data: realtime }: { data: TimeSeries | null }) {
  function realtimeValuesTransformation(data: WSWidgetData[]): Datum[] {
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

  const realtimeValuesTransformedFeedToChart = useRef<Serie[]>([
    {
      id: '',
      color: 'hsl(106, 70%, 50%)',
      data: [{ x: 0, y: 0 }],
    },
  ])
  if (realtime != null) {
    const data: Serie[] = Object.entries(realtime).map(([id, data], index) => ({
      id,
      color: 'hsl(106, 70%, 50%)',
      data: realtimeValuesTransformation(data),
    }))
    realtimeValuesTransformedFeedToChart.current = data
  }
  console.log(
    'realtimeValuesTransformedFeedToChart.current',
    realtimeValuesTransformedFeedToChart.current,
  )

  return (
    <ResponsiveLine
      data={realtimeValuesTransformedFeedToChart.current}
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
  )
}
