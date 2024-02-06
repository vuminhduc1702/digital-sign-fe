import { ResponsivePie } from '@nivo/pie'
import { useEffect, useRef, useState } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '~/components/Spinner'

import { type DataSeries, type TimeSeries, type LatestData } from '../../types'
import { type z } from 'zod'
import { type widgetSchema } from '../Widget'

type PieWidgetDataType = {
  keyId: string
  id: string
  label: string
  value: number
  [key: string]: string | number
}

export const PieChart = ({
  data,
  widgetInfo,
}: {
  data: DataSeries
  widgetInfo: z.infer<typeof widgetSchema>
}) => {
  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState<
    PieWidgetDataType[]
  >([])

  function getColor(attributeKey: string, deviceId: string) {
    const attributeConfig = widgetInfo.attribute_config.filter(
      obj => obj.attribute_key === attributeKey && obj.label === deviceId,
    )
    if (attributeConfig.length > 0) {
      return attributeConfig[0].color
    } else {
      return '#e8c1a0'
    }
  }

  useEffect(() => {
    if (data?.data) {
      const dataList = data.data
      const deviceList = data.device
      const parseResult = extractData(dataList, deviceList)
      setDataTransformedFeedToChart(dataManipulation(parseResult))
    }
  }, [data])

  function extractData(dataList: LatestData, deviceList: any[]) {
    const parseResult: Array<{
      name: string
      deviceName: string
      deviceId: string
      color: string
      value: any
    }> = []
    for (let i = 0; i < deviceList.length; i++) {
      for (const [key, value] of Object.entries(dataList[i])) {
        parseResult.push({
          name: key,
          deviceName: deviceList[i].entityName,
          deviceId: deviceList[i].id,
          color: getColor(key, deviceList[i].id),
          value: value.value,
        })
      }
    }
    return parseResult
  }

  function dataManipulation(parseResult : any[]) {
    return parseResult.map((item, index) => ({
      keyId: index, 
      id: item.name + ' (' + item.deviceName + ')',
      label: item.name + ' (' + item.deviceName + ')',
      value: item.value,
      [item.name + ' (' + item.deviceName + ')' + 'Color']: item.color,
    }))
  }

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
          colors={({ id, data }) => {
            return data[`${id}Color`] as string
          }}
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
              itemsSpacing: 20,
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
