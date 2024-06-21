import { type ReactElement } from 'react'
import { cn } from '@/utils/misc'

function TitleBar({
  title,
  className,
}: {
  title: string | ReactElement
  className?: string | Record<string, boolean>
}) {
  return (
    <h2
      className={cn('flex items-center py-2 text-xl font-semibold', className)}
    >
      {title}
    </h2>
  )
}

export default TitleBar
