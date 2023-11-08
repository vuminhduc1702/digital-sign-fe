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
        'focus:bg-accent focus:text-accent-foreground focus:rounded-[2px] focus:outline-none',
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
  console.log('state', state)

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn(
        'inline-flex h-10 w-full flex-1 justify-center border-t bg-transparent px-3 py-2 text-body-sm focus-visible:outline-none',
        // flex bg-white border border-gray-300 hover:border-gray-400 transition-colors rounded-md pr-8 focus-within:border-violet-600 focus-within:hover:border-violet-600 p-1
        props.isDisabled ? 'cursor-not-allowed opacity-50' : '',
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
