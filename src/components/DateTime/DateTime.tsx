import { useState } from 'react'
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
        wrapperClassName='w-full'
        className="w-full rounded-md border border-secondary-600 px-3 py-2 outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
        dateFormat="dd/MM/YYYY hh:mm aa"
        onChange={onChange}
        showTimeInput
        selected={value}
        {...props}
      />
    </>
  )
}
