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
  Fragment,
  createElement,
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
  colsVisibility = {},
  popoverClassName = 'absolute right-0 top-1 hidden',
  isAbsoluteBtn = true,
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
  colsVisibility?: VisibilityState
  popoverClassName?: string
  isAbsoluteBtn?: boolean
}) {
  const { t } = useTranslation()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState(colsVisibility)
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
    <div
      className={cn(
        'mt-2 flex grow flex-col justify-between overflow-x-auto',
        className,
      )}
    >
      {isPreviousData ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner size="xl" />
        </div>
      ) : (
        <>
          <table className="w-full border-2" id="table-ref">
            <thead className="border-b-2 bg-gray-200 text-center">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <th
                        className="h-9 text-center"
                        key={header.id}
                        colSpan={header.colSpan}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`text-table-header ${
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {/* <div className='flex items-center justify-center text-table-header'>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          </div>
                          <div className="w-2 pr-5 text-xl text-black">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div> */}
                            <div className="relative flex items-center justify-center text-table-header">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              <div className="absolute right-1 w-2 text-xl text-black">
                                {{
                                  asc: '↑',
                                  desc: '↓',
                                }[header.column.getIsSorted() as string] ??
                                  null}
                              </div>
                            </div>
                          </div>
                        )}
                      </th>
                    )
                  })}
                  {popoverClassName !== '' ? (
                    <>
                      <Popover>
                        <PopoverTrigger
                          onClick={e => e.stopPropagation()}
                          className={popoverClassName}
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
                        <PopoverContent
                          className="h-72 w-40 overflow-auto"
                          align="start"
                        >
                          <div className="absolute top-0 border-b border-black bg-white px-1 pt-2">
                            <label htmlFor="checkAll">
                              <input
                                type="checkbox"
                                id="checkAll"
                                className="mr-1 h-4 w-4 rounded-sm border accent-primary-400"
                                checked={table.getIsAllColumnsVisible()}
                                onChange={table.getToggleAllColumnsVisibilityHandler()}
                              />
                              {t(
                                'cloud:org_manage.device_manage.table.select_all',
                              )}
                            </label>
                          </div>

                          <div className="mt-4">
                            {table
                              .getAllLeafColumns()
                              .filter(
                                column =>
                                  column.id !== 'contextMenu' &&
                                  column.id !== 'stt',
                              )
                              .map(column => {
                                let title_column

                                if (
                                  column.columnDef &&
                                  typeof column.columnDef.header === 'function'
                                ) {
                                  const headerResult = column.columnDef.header()
                                  if (
                                    typeof headerResult.props?.children ===
                                    'string'
                                  ) {
                                    title_column = headerResult.props?.children
                                  } else if (
                                    typeof headerResult.props?.children ===
                                    'object'
                                  ) {
                                    title_column =
                                      headerResult.props?.children[0].props
                                        ?.children
                                  } else {
                                    title_column = ''
                                  }
                                  // console.log(title_column)
                                } else {
                                  title_column = ''
                                }

                                return (
                                  <div key={column.id} className="p-1">
                                    <label htmlFor={column.id}>
                                      <input
                                        type="checkbox"
                                        id={column.id}
                                        className="mr-1 h-4 w-4 rounded-sm border accent-primary-400"
                                        checked={column.getIsVisible()}
                                        onChange={column.getToggleVisibilityHandler()}
                                      />
                                      {title_column}
                                    </label>
                                  </div>
                                )
                              })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </>
                  ) : null}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => {
                return (
                  <Fragment key={row.id}>
                    <tr
                      className="border-secondary-70 border-t-2 text-center"
                      key={row.id}
                    >
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
                          // const cellStr = cell.getContext().getValue()
                          // let cellStrTrigger
                          // if (typeof cellStr == 'string') {
                          //   cellStrTrigger =
                          //     cellStr?.length > 10
                          //       ? cellStr.slice(0, 10) + '...'
                          //       : cellStr
                          // }

                          return (
                            <td className="h-9" key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          )
                          // return typeof cellStr == 'string' &&
                          //   cellStr != 'true' &&
                          //   cellStr != 'false' &&
                          //   isNaN(parseInt(cellStr)) ? (
                          //   <td className="h-9 cursor-default" key={cell.id}>
                          //     <TooltipProvider>
                          //       <Tooltip>
                          //         <TooltipTrigger>
                          //           {cellStrTrigger}
                          //         </TooltipTrigger>
                          //         <TooltipContent>
                          //           <p>
                          //             {flexRender(
                          //               cell.column.columnDef.cell,
                          //               cell.getContext(),
                          //             )}
                          //           </p>
                          //         </TooltipContent>
                          //       </Tooltip>
                          //     </TooltipProvider>
                          //   </td>
                          // ) : (
                          //   <td className="h-9" key={cell.id}>
                          //     {flexRender(
                          //       cell.column.columnDef.cell,
                          //       cell.getContext(),
                          //     )}
                          //   </td>
                          // )
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
      <div className="mt-4 flex items-center justify-between gap-2">
        <div
          className={cn('flex gap-3', {
            'absolute bottom-5': isAbsoluteBtn,
          })}
        >
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
        <div
          className={cn('flex gap-x-2', {
            'absolute bottom-5 right-6': isAbsoluteBtn,
          })}
        >
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
