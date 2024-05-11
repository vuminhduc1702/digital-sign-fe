import { cn } from '@/utils/misc'
import { useTranslation } from 'react-i18next'

export function MapSettingBrand({
  className = '',
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

  function handleMapType(type: number) {
    setMapType && setMapType(type)
  }

  return (
    <div
      className={cn(
        'absolute bottom-[5px] left-[10px] z-50 flex w-[32%] items-center justify-between border-2 bg-white px-[10px] py-[5px] shadow-lg',
        className,
      )}
    >
      <div
        className={`${mapType === 0 && 'font-bold'} flex basis-full cursor-pointer justify-center text-[10px]`}
        onClick={() => handleMapType(0)}
      >
        {t('cloud:dashboard.map.googleMap')}
      </div>
      <div
        className={`${mapType === 1 && 'font-bold'} flex basis-full cursor-pointer justify-center text-[10px]`}
        onClick={() => handleMapType(1)}
      >
        {t('cloud:dashboard.map.openStreetMap')}
      </div>
    </div>
  )
}
