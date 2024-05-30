import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export function DateTime({
  value,
  onChange,
  ...props
}: {
  value: Date | null
  onChange: (date: Date | null) => void
}) {
  return (
    <>
      <DatePicker
        className="w-[328px] rounded-md border border-secondary-600 px-3 py-2 outline-none disabled:cursor-not-allowed disabled:bg-gray-100
        "
        showTimeSelect
        showTimeSelectOnly
        dateFormat="HH:mm"
        timeFormat="HH:mm"
        timeIntervals={30}
        onChange={onChange}
        selected={value}
        {...props}
      />
    </>
  )
}
