import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type Row,
  getExpandedRowModel,
} from '@tanstack/react-table'
import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Pagination from './components/Pagination'
import { Button } from '../Button'
import { limitPagination } from '~/utils/const'
import { Spinner } from '../Spinner'
import { cn } from '~/utils/misc'

export function BaseTable<T extends Record<string, any>>({
  data,
  columns,
  offset = 0,
  setOffset,
  total,
  isPreviousData,
  className,
  renderSubComponent,
  getRowCanExpand,
}: {
  data: T[]
  columns: ColumnDef<T, string>[]
  offset?: number
  setOffset?: React.Dispatch<React.SetStateAction<number>>
  total?: number
  isPreviousData?: boolean
  className?: string
  renderSubComponent?: (props: { row: Row<T> }) => React.ReactElement
  getRowCanExpand?: (row: Row<T>) => boolean
}) {
  const { t } = useTranslation()

  const [sorting, setSorting] = useState<SortingState>([])

  const defaultData = useMemo(() => [], [])

  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    getRowCanExpand,
    getExpandedRowModel: getExpandedRowModel(),
  })

  const totalAttrs = total || data?.length
  const { pageSize } = table.getState().pagination

  useLayoutEffect(() => {
    table.setPageSize(10)
  }, [])

  const pageIndexRef = useRef(0)
  const countLimitPaginationRef = useRef(1)

  // TODO: Pagination Previous button is not working correctly

  return (
    <div className={cn('mt-2 flex grow flex-col justify-between', className)}>
      {isPreviousData ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner size="xl" />
        </div>
      ) : (
        <table className="w-full border-collapse" id="table-ref">
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
                        <div
                          className={`flex items-center justify-between text-table-header ${
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <div className="w-2 pr-5 text-xl text-black">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
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
                <Fragment key={row.id}>
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
                  {row.getIsExpanded() && (
                    <tr>
                      {/* 2nd row is a custom 1 cell row */}
                      <td colSpan={row.getVisibleCells().length}>
                        {renderSubComponent?.({ row })}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-body-light">
            {t('table:show_in')
              .replace(
                '{{PAGE}}',
                pageSize < totalAttrs
                  ? pageSize?.toString()
                  : totalAttrs?.toString(),
              )
              .replace('{{TOTAL}}', totalAttrs?.toString())}
          </span>
        </div>
        <div className="flex gap-x-2">
          <Button
            className="rounded-l-md border-none"
            onClick={() => {
              pageIndexRef.current--
              if (
                limitPagination < totalAttrs &&
                offset - limitPagination >= 0 &&
                (pageIndexRef.current + 1) * pageSize <=
                  limitPagination * countLimitPaginationRef.current
              ) {
                setOffset?.(offset => offset - limitPagination)
              }
              table.previousPage()
            }}
            disabled={pageIndexRef.current === 0 || isPreviousData}
            variant="secondaryLight"
          >
            {'Prev'}
          </Button>
          <Pagination
            currentPage={pageIndexRef.current}
            totalCount={totalAttrs}
            pageSize={pageSize}
            table={table}
          />
          <Button
            className="rounded-r-md border-none"
            onClick={() => {
              pageIndexRef.current++
              if (
                limitPagination < totalAttrs &&
                (pageIndexRef.current + 1) * pageSize >
                  limitPagination * countLimitPaginationRef.current
              ) {
                countLimitPaginationRef.current++
                setOffset?.(offset => offset + limitPagination)
              }
              table.nextPage()
            }}
            disabled={
              (pageIndexRef.current + 1) * pageSize >= totalAttrs ||
              isPreviousData
            }
            variant="secondaryLight"
          >
            {'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
