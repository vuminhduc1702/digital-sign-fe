import { useState } from 'react'

type DashboardTooltipProps = {
  content: JSX.Element
  image: JSX.Element
}

export function DashboardTooltip({ content, image }: DashboardTooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {content}
        {show && (
          <div className="absolute top-[110%] z-10 w-[245px]">{image}</div>
        )}
      </div>
    </div>
  )
}
