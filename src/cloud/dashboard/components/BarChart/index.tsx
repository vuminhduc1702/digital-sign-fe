import { useRef } from 'react'
import { ResponsiveBar } from '@nivo/bar'

import { type DashboardWS } from '../../types'

type BarChartData = {
  device: string
  [key: string]: string
}

export const BarChart = ({ data }: { data: DashboardWS['data'] }) => {
  const prevEntityNameRef = useRef('')

  const lastestMultiValue = data?.map(item => {
    let entityName = ''
    const entityValue: { [key: string]: number } = {}
    for (const [key, value] of Object.entries(item.latest.TIME_SERIES)) {
      entityValue[key] = parseFloat(value.value)
    }
    if (item.latest.ENTITY_FIELD != null) {
      entityName = item.latest.ENTITY_FIELD.name.value
      prevEntityNameRef.current = entityName
    } else entityName = prevEntityNameRef.current

    return {
      device: entityName,
      // device,
      ...entityValue,
    }
  })
  // console.log('lastestMultiValue', lastestMultiValue)

  const dataTest = [
    {
      ts: 1697618777,
      attr1: 165,
      attr2: 34,
    },
    {
      ts: 1697618783,
      attr3: 165,
    },
  ]

  return (
    <ResponsiveBar
      data={dataTest}
      keys={['attr1', 'attr2', 'attr3']}
      indexBy="ts"
      colors={['hsl(308, 70%, 50%)', 'hsl(80, 70%, 50%)', 'hsl(12, 70%, 50%)']}
      // colors={{ scheme: 'nivo' }}
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      // defs={[
      //   {
      //     id: 'dots',
      //     type: 'patternDots',
      //     background: 'inherit',
      //     color: '#38bcb2',
      //     size: 4,
      //     padding: 1,
      //     stagger: true,
      //   },
      //   {
      //     id: 'lines',
      //     type: 'patternLines',
      //     background: 'inherit',
      //     color: '#eed312',
      //     rotation: -45,
      //     lineWidth: 6,
      //     spacing: 10,
      //   },
      // ]}
      // fill={[
      //   {
      //     match: {
      //       id: 'fries',
      //     },
      //     id: 'dots',
      //   },
      //   {
      //     match: {
      //       id: 'sandwich',
      //     },
      //     id: 'lines',
      //   },
      // ]}
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
  )
}
