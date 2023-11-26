import { useEffect, useState } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '~/components/Spinner'

import { type LatestData } from '../../types'

export function CardChart({ data }: { data: LatestData }) {
  // console.log('new card: ', data)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState({
    key: '',
    value: '',
  })

  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      const dataDataType = {
        key: Object.keys(data)[0],
        value: Object.values(data)?.[0]?.value,
      }
      setDataTransformedFeedToChart(dataDataType)
    }
  }, [data])

  const showSpinner = useSpinDelay(Object.keys(data).length === 0, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <>
      {Object.keys(dataTransformedFeedToChart).length > 0 ? (
        <div className="flex h-full flex-col items-center justify-center border border-secondary-400 bg-white shadow hover:bg-gray-100">
          <p className="mb-2 text-body-sm opacity-70">
            {dataTransformedFeedToChart.key}
          </p>
          <h2 className="text-4xl font-bold">
            {dataTransformedFeedToChart.value}
          </h2>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      )}
    </>
  )
}
