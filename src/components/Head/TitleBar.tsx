import { type ReactElement } from 'react'
import { cn } from '~/utils/misc'

function TitleBar({
  title,
  className,
}: {
  title: string | ReactElement
  className?: string | Record<string, boolean>
}) {
  return (
    <h2
      className={cn(
        'flex h-9 items-center rounded-tr-md bg-primary-400 px-10 text-h2 text-white',
        className,
      )}
    >
      {title}
    </h2>
  )
}

export default TitleBar
