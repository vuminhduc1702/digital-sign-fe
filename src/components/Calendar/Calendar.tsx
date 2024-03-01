import { type ComponentProps } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import { DayPicker } from 'react-day-picker'

import { cn } from '~/utils/misc'

export type CalendarProps = ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-table-header',
        nav: 'space-x-1 flex items-center',
        nav_button: cn('h-7 w-7 p-0 opacity-50 hover:opacity-100'),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-table-header rounded-md w-9',
        row: 'flex w-full mt-2',
        cell: 'text-center text-body-sm p-0 relative [&:has([aria-selected])]:bg-primary-300 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn('h-9 w-9 p-0 aria-selected:opacity-100'),
        day_selected:
          'bg-primary-300 font-bold hover:bg-primary-300 hover:font-bold focus:bg-primary-300 focus:font-bold text-white',
        day_today: 'font-bold text-table-header',
        day_outside: 'text-body-sm opacity-50',
        day_disabled: 'text-body-sm opacity-50',
        day_range_middle:
          'aria-selected:bg-primary-300 aria-selected:font-bold',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <HiChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <HiChevronRight className="h-4 w-4" />,
      }}
      captionLayout="dropdown-buttons"
      disabled={date => date > new Date() || date < new Date('1900-01-01')}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
