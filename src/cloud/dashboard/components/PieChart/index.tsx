import { ResponsivePie } from '@nivo/pie'
import { SetStateAction, useEffect, useState } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '~/components/Spinner'

import { type TimeSeries } from '../../types'
import { z } from 'zod'
import { widgetSchema } from '../Widget'

type PieWidgetDataType = {
  id: string
  label: string
  value: number
  [key: string]: string | number
}

export const PieChart = ({ data, widgetInfo }: { data: TimeSeries, widgetInfo: z.infer<typeof widgetSchema> }) => {
  // console.log(`new pie: `, data)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    PieWidgetDataType[]
  >([])

  function dataManipulation() {
    const newData = Object.entries(data).reduce(
      (
        result: Array<{ id: string; label: string, value: number }>,
        [key, items],
      ) => {
        items.forEach(item => {
          dataTransformedFeedToChart.forEach((attr) => {
            const itemId = attr.id
            const value = parseFloat(item.value)
            const existingIndex = result.filter(obj => obj.id === itemId)
            if (existingIndex.length === 0) {
              result.push({
                id: key,
                label: key,
                value: parseFloat(item.value),
                [key + 'Color']: widgetInfo.attribute_config.filter(obj => obj.attribute_key === key) && 
                widgetInfo.attribute_config.filter(obj => obj.attribute_key === key).length > 0 && 
                widgetInfo.attribute_config.filter(obj => obj.attribute_key === key)[0].color !== '' ?
                widgetInfo.attribute_config.filter(obj => obj.attribute_key === key)[0].color :
                '#e8c1a0'
              })
            } else {
              result.map(obj => obj.id === itemId ? { ...obj, value: value} : obj)
            }
          })
        })

        const dataResult = result.filter((obj, index) => {
          return index === result.findIndex(o => obj.id === o.id);
        });
        return dataResult
      },
      [],
    )
    setDataTransformedFeedToChart(newData)
  }

  // const newDataValue = Object.values(data)?.[0]?.[0]?.value ?? ''
  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      if (dataTransformedFeedToChart.length > 0) {
        dataManipulation()
      } else if (dataTransformedFeedToChart.length === 0) {
        const pieWidgetDataType = Object.entries(data).map(([key, value]) => ({
          id: key,
          label: key,
          value: parseFloat(value[0].value),
          [key + 'Color']: widgetInfo.attribute_config.filter(obj => obj.attribute_key === key) && 
          widgetInfo.attribute_config.filter(obj => obj.attribute_key === key).length > 0 && 
          widgetInfo.attribute_config.filter(obj => obj.attribute_key === key)[0].color !== '' ?
          widgetInfo.attribute_config.filter(obj => obj.attribute_key === key)[0].color :
          '#e8c1a0'
        }))
        setDataTransformedFeedToChart(pieWidgetDataType)
      }
    }
  }, [data])

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
          colors={({id, data}) => data[`${id}Color`]}
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
              data: widgetInfo.attribute_config.map(item => ({
                id: item.attribute_key,
                label: item.unit !== '' ? item.attribute_key + ' (' + item.unit + ')' : item.attribute_key,
                color: item.color ? item.color : '#e8c1a0'
              }))
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
