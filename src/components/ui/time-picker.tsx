import { useRef, forwardRef } from 'react'

import {
  type AriaTimeFieldProps,
  type TimeValue,
  useLocale,
  useTimeField,
  useDateSegment,
} from 'react-aria'
import {
  useTimeFieldState,
  type DateFieldState,
  type DateSegment as IDateSegment,
  type TimeFieldStateOptions,
} from 'react-stately'
import { cn } from '~/utils/misc'

type DateSegmentProps = {
  segment: IDateSegment
  state: DateFieldState
}

function DateSegment({ segment, state }: DateSegmentProps) {
  const ref = useRef(null)

  const {
    segmentProps: { ...segmentProps },
  } = useDateSegment(segment, state, ref)

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={cn(
        'focus:text-accent-foreground focus:rounded-[2px] focus:bg-primary-300 focus:bg-opacity-75 focus:outline-none',
        segment.type !== 'literal' ? 'px-[1px]' : '',
        segment.isPlaceholder ? 'text-muted-foreground' : '',
      )}
    >
      {segment.text}
    </div>
  )
}

function TimeField(props: AriaTimeFieldProps<TimeValue>) {
  const ref = useRef<HTMLDivElement | null>(null)

  const { locale } = useLocale()
  const state = useTimeFieldState({
    ...props,
    locale,
  })
  const {
    fieldProps: { ...fieldProps },
    labelProps,
  } = useTimeField(props, state, ref)

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn(
        'focus-within:black mx-auto flex h-10 w-fit justify-center rounded-none border border-secondary-600 bg-transparent px-3 py-2 text-body-sm shadow-sm transition-colors hover:border-black focus-within:hover:border-secondary-600 focus-visible:outline-none',
        props.isDisabled
          ? 'cursor-not-allowed bg-secondary-500 text-black hover:border-secondary-600'
          : '',
      )}
    >
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  )
}

export const TimePicker = forwardRef<
  HTMLDivElement,
  Omit<TimeFieldStateOptions<TimeValue>, 'locale'>
>((props, forwardedRef) => {
  return <TimeField {...props} />
})

TimePicker.displayName = 'TimePicker'
