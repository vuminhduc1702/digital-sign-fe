import { Column, Table } from '@tanstack/react-table'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import DebouncedInput from '../Pagination/DebouncedInput'

export default function Filter({
  column,
  table,
}: {
  column: Column<any, unknown>
  table: Table<any>
}) {
  const { t } = useTranslation()

  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()
  // const sortedUniqueValues = useMemo(
  //   () =>
  //     typeof firstValue === 'number'
  //       ? []
  //       : Array.from(column.getFacetedUniqueValues().keys()).sort(),
  //   [column.getFacetedUniqueValues()],
  // )

  return typeof firstValue === 'number' ? (
    <>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`${t('table:min')} ${
            column.getFacetedMinMaxValues()?.[0]
              ? `(${column.getFacetedMinMaxValues()?.[0]})`
              : ''
          }`}
          className="w-[50px] border shadow rounded outline-none px-[10px] py-[5px] my-[5px]"
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`${t('table:max')} ${
            column.getFacetedMinMaxValues()?.[1]
              ? `(${column.getFacetedMinMaxValues()?.[1]})`
              : ''
          }`}
          className="w-[50px] border shadow rounded outline-none px-[10px] py-[5px] my-[5px]"
        />
      </div>
      <div className="h-1" />
    </>
  ) : (
    <>
      {/* <datalist id={column.id + 'list'}>
        {sortedUniqueValues.slice(0, 5000).map((value: any) => {
          return <option value={value} key={value} />
        })}
      </datalist> */}
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={value => {
          column.setFilterValue(value)
        }}
        placeholder={t('table:search')}
        className="w-[90px] border shadow rounded outline-none px-[10px] py-[5px] mt-[5px]"
        list={column.id + 'list'}
      />
      <div className="h-1" />
    </>
  )
}
