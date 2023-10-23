import { ResponsivePie } from '@nivo/pie'
import { useEffect, useState } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '~/components/Spinner'

import { type TimeSeries } from '../../types'

type PieWidgetDataType = {
  id: string
  label: string
  value: number
  [key: string]: string | number
}

export const PieChart = ({ data }: { data: TimeSeries }) => {
  // console.log(`new pie: `, data)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    PieWidgetDataType[]
  >([])

  const newDataValue = Object.values(data)?.[0]?.[0]?.value ?? ''
  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      const pieWidgetDataType = Object.entries(data).map(([key, value]) => ({
        id: key,
        label: key,
        value: parseFloat(value[0].value),
      }))
      setDataTransformedFeedToChart(pieWidgetDataType)
    }
  }, [newDataValue])

  const showSpinner = useSpinDelay(dataTransformedFeedToChart.length === 0, {
    delay: 150,
    minDuration: 300,
  })

  // console.log('transform pie', dataTransformedFeedToChart)

  return (
    <>
      {dataTransformedFeedToChart.length > 0 ? (
        <ResponsivePie
          data={dataTransformedFeedToChart}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          colors={{ scheme: 'nivo' }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 0.2]],
          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: 'color',
            modifiers: [['darker', 2]],
          }}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: '#999',
              itemDirection: 'left-to-right',
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: 'circle',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: '#000',
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
