import { useEffect, useState } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '~/components/Spinner'

import { type LatestData } from '../../types'

export function CardChart({ data, unit }: { data: LatestData, unit: string }) {
  // console.log('new card: ', data)
  // console.log('unit: ', unit)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState({
    key: '',
    value: '',
  })
  const [unitData, setUnitData] = useState<string>("")

  useEffect(() => {
    if (data != null && Object.keys(data).length > 0) {
      const dataDataType = {
        key: Object.keys(data)[0],
        value: Object.values(data)?.[0]?.value,
      }
      setDataTransformedFeedToChart(dataDataType)
      setUnitData(unit)
    }
  }, [data])

  return (
    <>
      {Object.keys(dataTransformedFeedToChart).length > 0 ? (
        <div className="flex h-full flex-col items-center justify-center border border-secondary-400 bg-white shadow hover:bg-gray-100">
          <p className="mb-2 text-body-sm opacity-70">
            {dataTransformedFeedToChart.key}
            {" ("}
            {unitData}
            {")"}
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
