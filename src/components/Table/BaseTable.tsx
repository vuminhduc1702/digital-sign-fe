import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { Fragment, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Pagination from './components/Pagination'
import { Button } from '../Button'
import { limitPagination } from '~/utils/const'

import { type PropertyValuePair } from '~/utils/misc'

export function BaseTable({
  data,
  columns,
  offset = 0,
  setOffset,
  total,
}: {
  data: PropertyValuePair<string>[]
  columns: ColumnDef<PropertyValuePair<string>, string>[]
  offset?: number
  setOffset?: React.Dispatch<React.SetStateAction<number>>
  total?: number
}) {
  const { t } = useTranslation()

  const defaultData = useMemo(() => [], [])

  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    // Pipeline
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    //
    debugTable: true,
  })

  const { pageIndex } = table.getState().pagination
  const totalAttrs = total || data?.length
  console.log('totalAttrs', totalAttrs)

  return (
    <>
      {data != null && data?.length !== 0 ? (
        <div className="mt-2 flex grow flex-col justify-between">
          <table className="w-full border-collapse">
            <thead className="border-b-2 border-secondary-700">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <th
                        className="h-9 text-left"
                        key={header.id}
                        colSpan={header.colSpan}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="text-table-header">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </div>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => {
                return (
                  <tr className="border-secondary-70 border-t-2" key={row.id}>
                    {row.getVisibleCells().map((cell, index) => {
                      if (index === row.getVisibleCells().length - 1) {
                        return (
                          <Fragment key={cell.id}>
                            <td className="h-9" key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          </Fragment>
                        )
                      } else {
                        return (
                          <td className="h-9" key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        )
                      }
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-body-light">
                {t('table.show_in')
                  .replace(
                    '{{PAGE}}',
                    limitPagination < totalAttrs
                      ? limitPagination?.toString()
                      : totalAttrs?.toString(),
                  )
                  .replace('{{TOTAL}}', totalAttrs?.toString())}
              </span>
            </div>
            <div className="flex gap-x-2">
              <Button
                className="rounded-l-md border-none"
                onClick={() => {
                  setOffset?.(offset => offset - limitPagination)
                  table.previousPage()
                }}
                disabled={offset === 0}
                variant="secondaryLight"
              >
                {'Prev'}
              </Button>
              <Pagination
                currentPage={pageIndex}
                totalCount={totalAttrs}
                pageSize={limitPagination}
                table={table}
              />
              <Button
                className="rounded-r-md border-none"
                onClick={() => {
                  setOffset?.(offset => offset + limitPagination)
                  table.nextPage()
                }}
                disabled={offset + limitPagination >= totalAttrs}
                variant="secondaryLight"
              >
                {'Next'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex grow items-center justify-center">
          {t('table.no_attr')}
        </div>
      )}
    </>
  )
}
