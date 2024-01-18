import { ResponsivePie } from '@nivo/pie'
import { useEffect, useRef, useState } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '~/components/Spinner'

import { type DataSeries } from '../../types'
import { type z } from 'zod'
import { type widgetSchema } from '../Widget'

type PieWidgetDataType = {
  keyId: string
  id: string
  label: string
  value: number
  [key: string]: string | number
}

export const PieChart = ({ data, widgetInfo }: { data: DataSeries, widgetInfo: z.infer<typeof widgetSchema> }) => {

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    PieWidgetDataType[]
  >([])
  const newValuesRef = useRef<DataSeries | null>(null)
  const prevValuesRef = useRef<DataSeries | null>(null)

  function dataManipulation() {
    if (newValuesRef.current?.data && newValuesRef.current.device) {
      const pieWidgetData = Object.entries(newValuesRef.current.data).reduce((result: Array<PieWidgetDataType>, item, index) => {
        const parseResult = Object.entries(item[1]).map(([key, value]) => ({
          id: key + ' (' + newValuesRef.current?.device?.[index].entityName + ')',
          label: key + ' (' + newValuesRef.current?.device?.[index].entityName + ')',
          value: parseFloat(value.value),
          [key + ' (' + newValuesRef.current?.device?.[index].entityName + ')' + 'Color']:
            widgetInfo.attribute_config.filter(obj => obj.attribute_key === key) &&
            widgetInfo.attribute_config.filter(obj => obj.attribute_key === key)
              .length > 0 &&
            widgetInfo.attribute_config.filter(obj => obj.attribute_key === key)[0]
              .color !== ''
              ? widgetInfo.attribute_config.filter(
                  obj => obj.attribute_key === key,
                )[0].color
              : '#e8c1a0',
        }))
        result.push(parseResult)
        return result
      }, []).flat()
      setDataTransformedFeedToChart(pieWidgetData)
    }
  }

  useEffect(() => {
    if (data.data) {
        prevValuesRef.current = newValuesRef.current || data
        if (newValuesRef.current !== null) {
          const deviceIndex = newValuesRef.current.device.findIndex(
            device => device.id === data.device[0].id,
          )
          if (deviceIndex !== -1 && data.data[0]) {
            for (const [key, newData] of Object.entries(data.data[0])) {
              if (
                key !== null &&
                newData !== null &&
                newValuesRef.current?.data?.[deviceIndex]?.[key] ===
                  prevValuesRef.current?.data?.[deviceIndex]?.[key]
              ) {
                setTimeout(() => {
                  Object.assign(newValuesRef.current?.data?.[deviceIndex]?.[key], newData)
                }, 200)
              }
            }
          } else {
            prevValuesRef.current = data
          }
          dataManipulation()
        } else {
          newValuesRef.current = data
          dataManipulation()
      }
    }
  }, [data])

  const showSpinner = useSpinDelay(dataTransformedFeedToChart.length === 0, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <>
      {dataTransformedFeedToChart.length > 0 ? (
        <ResponsivePie
          data={dataTransformedFeedToChart}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          colors={({ id, data }) => data[`${id}Color`]}
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
