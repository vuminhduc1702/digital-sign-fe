import { cn } from '@/utils/misc'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function MapSettingType({
  className = '',
  isMapLabel,
  setIsMapLabel,
  mapType,
  setMapType,
}: {
  className?: string
  isMapLabel?: boolean
  setIsMapLabel?: React.Dispatch<React.SetStateAction<boolean>>
  mapType?: number
  setMapType?: React.Dispatch<React.SetStateAction<number>>
}) {
  const { t } = useTranslation()

  function handleLabel() {
    setIsMapLabel && setIsMapLabel(!isMapLabel)
  }

  function handleMapType(type: number) {
    setMapType && setMapType(type)
  }

  return (
    <div
      className={cn(
        'absolute bottom-[5px] right-[10px] z-50 flex w-[30%] items-center justify-between border-2 bg-white px-[10px] py-[5px] shadow-lg ',
        className,
      )}
    >
      {/* <div
        className={`${isMapLabel && 'font-bold'} flex basis-full cursor-pointer justify-center`}
        onClick={() => handleLabel()}
      >
        {t('cloud:dashboard.map.label')}
      </div> */}
      <div
        className={`${mapType === 0 && 'font-bold'} flex basis-full cursor-pointer justify-center text-[10px]`}
        onClick={() => handleMapType(0)}
      >
        {t('cloud:dashboard.map.street')}
      </div>
      <div
        className={`${mapType === 1 && 'font-bold'} flex basis-full cursor-pointer justify-center text-[10px]`}
        onClick={() => handleMapType(1)}
      >
        {t('cloud:dashboard.map.satellite')}
      </div>
    </div>
  )
}
