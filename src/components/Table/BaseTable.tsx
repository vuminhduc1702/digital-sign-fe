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

import { type PropertyValuePair } from '~/utils/misc'

export function BaseTable({
  data,
  columns,
}: {
  data: PropertyValuePair<string>[]
  columns: ColumnDef<PropertyValuePair<string>, string>[]
}) {
  const { t } = useTranslation()

  const totalAttr = data?.length

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

  const { pageIndex, pageSize } = table.getState().pagination

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
                        className="h-11 text-left"
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
                            <td className="h-11" key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          </Fragment>
                        )
                      } else {
                        return (
                          <td className="h-11" key={cell.id}>
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-body-light">
                {t('table.show_in')
                  .replace(
                    '{{PAGE}}',
                    pageSize < totalAttr
                      ? pageSize?.toString()
                      : totalAttr?.toString(),
                  )
                  .replace('{{TOTAL}}', totalAttr?.toString())}
              </span>
            </div>
            <div className="flex gap-x-2">
              <Button
                className="rounded-l-md border-none"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                variant="secondary"
              >
                {'Prev'}
              </Button>
              <Pagination
                currentPage={pageIndex}
                totalCount={totalAttr}
                pageSize={pageSize}
                table={table}
              />
              <Button
                className="rounded-r-md border-none"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                variant="secondary"
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
