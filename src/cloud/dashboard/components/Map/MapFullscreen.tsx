import { LuExpand, LuMinimize } from 'react-icons/lu'
import { cn } from '@/utils/misc'

type MapFullscreenProps = {
  isFullscreen: boolean
  setFullscreen: React.Dispatch<React.SetStateAction<boolean>>
  className?: string
}

export function MapFullscreen({
  isFullscreen,
  setFullscreen,
  className,
}: MapFullscreenProps) {
  return (
    <div
      className={cn(
        'absolute left-[17px] top-[130px] z-50 border-2 border-secondary-600 bg-white p-[9px] shadow-lg',
        className,
      )}
      onClick={() => setFullscreen(!isFullscreen)}
    >
      {isFullscreen ? (
        <LuMinimize className="cursor-pointer" />
      ) : (
        <LuExpand className="cursor-pointer" />
      )}
    </div>
  )
}
