import { useEffect, useState } from 'react'
import { useSpinDelay } from 'spin-delay'
import { type z } from 'zod'

import { Spinner } from '~/components/Spinner'

import { type LatestData } from '../../types'
import { type widgetSchema } from '../Widget'

export function CardChart({
  data,
  widgetInfo,
}: {
  data: LatestData
  widgetInfo: z.infer<typeof widgetSchema>
}) {
  // console.log('new card: ', data)
  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState({
    key: '',
    value: '',
  })

  useEffect(() => {
    if (data != null && Object.keys(data).length > 0) {
      const dataDataType = {
        key: Object.keys(data)[0],
        value: Object.values(data)?.[0]?.value,
      }
      setDataTransformedFeedToChart(dataDataType)
    }
  }, [data])

  return (
    <>
      {Object.keys(dataTransformedFeedToChart).length > 0 ? (
        <div className="flex h-full flex-col items-center justify-center border border-secondary-400 bg-white shadow hover:bg-gray-100">
          <p className="mb-2 text-body-sm opacity-70">
            {dataTransformedFeedToChart.key}
            {' ('}
            {widgetInfo?.attribute_config[0]?.unit}
            {')'}
          </p>
          <h2 className="text-4xl font-bold">
            {dataTransformedFeedToChart.value}
          </h2>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Spinner showSpinner size="xl" />
        </div>
      )}
    </>
  )
}
