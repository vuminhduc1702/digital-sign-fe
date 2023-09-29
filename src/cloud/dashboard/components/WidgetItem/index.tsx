import clsx from 'clsx'
import React from 'react'

// const sizes = {
//   sm: 'h-4 w-4',
//   md: 'h-8 w-8',
//   lg: 'h-16 w-16',
//   xl: 'h-24 w-24',
// }

export type WidgetProps = {
  key?: string
  title?: string
  // size?: keyof typeof sizes
  className?: string
  titleBackground?: string
  background?: string
  titleColor?: string,
  w?: number,
  h?: number
}

export const WidgetItem = React.forwardRef(({
  key='',
  title = '',
  titleColor = '#ffffff',
  titleBackground = '#4b4c4d',
  // size = 'md',
  className = '',
  background = '#ffffff',
  w = 1,
  h = 1,
  ...props
}: WidgetProps) => {

  return (
    <div key={key} className={clsx(className, 'wrapper')} style={{width: `${w}`, height: `${h}`, background: `${background}`, boxShadow: `0px 5px 15px #000000` }} {...props}>
      <div style={{padding: '8px', background: `${titleBackground}`, color: `${titleColor}` }}>{title}</div>
      <span className='react-resizable-handle react-resizable-handle-se'></span>
    </div>
  )
})

WidgetItem.displayName = "WidgetItem"