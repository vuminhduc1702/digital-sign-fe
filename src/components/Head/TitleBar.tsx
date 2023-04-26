import clsx from 'clsx'

import { type ReactElement } from 'react'

function TitleBar({
  title,
  className,
}: {
  title: string | ReactElement
  className?: string | Record<string, boolean>
}) {
  return (
    <h2
      className={clsx(
        'flex h-9 items-center rounded-tr-md bg-primary-400 px-10 text-h2 uppercase text-white',
        className,
      )}
    >
      {title}
    </h2>
  )
}

export default TitleBar
