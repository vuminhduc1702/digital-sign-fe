import { type Datum, ResponsiveLine, type Serie } from '@nivo/line'

import { defaultDateConfig, getVNDateFormat } from '~/utils/misc'

import { type WSWidgetData } from '../../types'

export function LineChart({ data }: { data: WSWidgetData[] }) {
  const liveValuesTransformed: Datum[] = data
    ?.map(({ ts, value }: WSWidgetData) => ({
      x: getVNDateFormat({
        date: ts,
        config: { ...defaultDateConfig, second: '2-digit' },
      }),
      y: parseFloat(value),
    }))
    // .reverse()
    .slice(-10)

  const liveValuesTransformedFeedToChart: Serie[] = [
    {
      id: 'test',
      color: 'hsl(106, 70%, 50%)',
      data: liveValuesTransformed,
    },
  ]

  return (
    <ResponsiveLine
      data={liveValuesTransformedFeedToChart}
      margin={{ top: 50, right: 30, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: true,
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
