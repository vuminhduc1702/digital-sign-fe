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
  type VisibilityState,
} from '@tanstack/react-table'
import {
  type Dispatch,
  Fragment,
  type SetStateAction,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import Pagination from './components/Pagination'
import { Button } from '../Button'
import { limitPagination } from '~/utils/const'
import { Spinner } from '../Spinner'
import { cn } from '~/utils/misc'
import { SettingIcon } from '~/components/SVGIcons'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
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
  columnVisibility,
  setColumnVisibility,
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
  columnVisibility?: VisibilityState
  setColumnVisibility?: Dispatch<SetStateAction<VisibilityState>>
}) {
  const { t } = useTranslation()

  const [sorting, setSorting] = useState<SortingState>([])

  const defaultData = useMemo(() => [], [])

  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    getRowCanExpand,
    onColumnVisibilityChange: setColumnVisibility,
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
        <>
          <table className="w-full border-collapse" id="table-ref">
            <thead className="border-secondary-700 border-b-2">
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
                            className={`text-table-header flex items-center justify-between ${
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
                  <Popover>
                    <PopoverTrigger
                      onClick={e => e.stopPropagation()}
                      className=""
                      asChild
                    >
                      <Button
                        className="border-none shadow-none"
                        variant="trans"
                        size="square"
                        startIcon={
                          <SettingIcon
                            className="h-9"
                            height={24}
                            width={24}
                            viewBox="0 0 48 48"
                          />
                        }
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-40" align="start">
                      <div className="mb-1 border-b border-black px-1">
                        <label>
                          <input
                            {...{
                              type: 'checkbox',
                              className:
                                'ring-offset-background focus-visible:ring-ring peer h-4 w-4 shrink-0 rounded-sm border border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-400 data-[state=checked]:text-white',
                              checked: table.getIsAllColumnsVisible(),
                              onChange:
                                table.getToggleAllColumnsVisibilityHandler(),
                            }}
                          />{' '}
                          Toggle All
                        </label>
                      </div>
                      {table.getAllLeafColumns().map(column => {
                        return (
                          <div key={column.id} className="px-1">
                            <label>
                              <input
                                {...{
                                  type: 'checkbox',
                                  className:
                                    'ring-offset-background focus-visible:ring-ring peer h-4 w-4 shrink-0 rounded-sm border border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-400 data-[state=checked]:text-white',
                                  checked: column.getIsVisible(),
                                  onChange: column.getToggleVisibilityHandler(),
                                }}
                              />{' '}
                              {column.id}
                            </label>
                          </div>
                        )
                      })}
                    </PopoverContent>
                  </Popover>
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
        </>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex gap-3">
          <span className="text-body-light flex items-center gap-1">
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
