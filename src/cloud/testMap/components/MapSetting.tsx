import { set } from 'date-fns'
import React from 'react'

export default function MapSetting({
  className = '',
  isLabel,
  setIsLabel,
  mapType,
  setMapType,
}: {
  className?: string
  isLabel?: boolean
  setIsLabel?: React.Dispatch<React.SetStateAction<boolean>>
  mapType?: number
  setMapType?: React.Dispatch<React.SetStateAction<number>>
}) {
  function handleLabel() {
    setIsLabel && setIsLabel(!isLabel)
  }

  function handleMapType(type: number) {
    setMapType && setMapType(type)
  }

  return (
    <div
      className={`z-50 flex w-[210px] items-center justify-between border-2 bg-white px-[10px] py-[5px] shadow-lg ${className}`}
    >
      <div
        className={`${isLabel && 'font-bold'} cursor-pointer text-xs`}
        onClick={() => handleLabel()}
      >
        Show label
      </div>
      <div
        className={`${mapType === 0 && 'font-bold'} cursor-pointer text-xs`}
        onClick={() => handleMapType(0)}
      >
        Map
      </div>
      <div
        className={`${mapType === 1 && 'font-bold'} cursor-pointer text-xs`}
        onClick={() => handleMapType(1)}
      >
        Satellite
      </div>
    </div>
  )
}
