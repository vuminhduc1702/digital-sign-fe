import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/utils/misc'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    isLoading: boolean
  }
>(({ className, value, isLoading, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'bg-secondary absolute h-[5px] w-full overflow-hidden',
      className,
      {
        'animate-loading-bar': isLoading,
      },
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="translateX(100%) bg-primary h-full w-full flex-1 transition-all"
      style={{
        transform: isLoading ? `translateX(0%)` : `translateX(100%)`,
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
