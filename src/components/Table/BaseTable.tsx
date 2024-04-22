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
  type FilterFn,
  getFilteredRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
} from '@tanstack/react-table'
import { Fragment, type HTMLProps, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { rankItem } from '@tanstack/match-sorter-utils'

import { Button } from '../Button'
import { limitPagination } from '~/utils/const'
import { Spinner } from '../Spinner'
import { cn } from '~/utils/misc'
import { SettingIcon } from '~/components/SVGIcons'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import PaginationRender from './components/Pagination/PaginationRender'
import Filter from './components/FilterTable/Filter'

import refreshIcon from '~/assets/icons/table-refresh.svg'
import btnFilterIcon from '~/assets/icons/btn-filter.svg'
import { useNavigate } from 'react-router-dom'

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank,
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!)

  useEffect(() => {
    if (typeof indeterminate === 'boolean' && ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input
      style={{
        accentColor: '#e74c3c',
      }}
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}

export function BaseTable<T extends Record<string, any>>({
  data = [],
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
  onDataText,
  refreshBtn,
  callbackParent,
  rowSelection = {},
  setRowSelection,
  isHiddenCheckbox = false,
  filterBtnClassName = 'absolute top-10 right-0',
  path,
  projectId,
  orgId,
  navigateToDetailNoOrg = false,
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
  onDataText?: string
  refreshBtn?: boolean
  callbackParent?: () => void
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
  isHiddenCheckbox?: boolean
  filterBtnClassName?: string
  path?: string
  projectId?: string
  orgId?: string
  navigateToDetailNoOrg?: boolean
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState(colsVisibility)
  const [isRefresh, setIsRefresh] = useState(false)
  const tableIndex = useRef(0)

  if (!isHiddenCheckbox && !columns.some(column => column.id === 'select')) {
    columns.unshift({
      id: 'select',
      header: info => (
        <IndeterminateCheckbox
          {...{
            checked: info?.table.getIsAllRowsSelected(),
            indeterminate: info?.table.getIsSomeRowsSelected(),
            onChange: info?.table.getToggleAllRowsSelectedHandler(),
          }}
        />
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        </div>
      ),
    })
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    getRowCanExpand,
    onColumnVisibilityChange: setColumnVisibility,
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: true, //enable row selection for all rows
    onRowSelectionChange: setRowSelection,
    getRowId: row => (row.id ? row.id : row.user_id),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })
  const totalAttrs = total || data?.length
  const [columnFilter, setColumnFilter] = useState(
    table
      .getAllLeafColumns()
      .filter(col => {
        if (
          col.id !== 'stt' &&
          col.id !== 'contextMenu' &&
          col.id !== 'select' &&
          col.id !== 'created_time'
        ) {
          return col
        }
      })
      .map(col => {
        return {
          id: col.id,
          isVisible: false,
        }
      }),
  )

  function refresh() {
    setIsRefresh(true)
    callbackParent?.()
    setTimeout(() => {
      setIsRefresh(false)
    }, 500)
  }

  useEffect(() => {
    setTimeout(() => {
      table.setPageIndex(
        tableIndex.current - offset / table.getState().pagination.pageSize,
      )
    }, 1)
  }, [data])

  return (
    <div
      className={cn(
        'mt-2 flex grow flex-col justify-between overflow-x-auto',
        className,
      )}
    >
      {isPreviousData && offset == 0 ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner size="xl" />
        </div>
      ) : (
        <>
          <table
            className={cn('w-full border-2', { 'h-[90%]': totalAttrs === 0 })}
            id="table-ref"
          >
            <thead className=" border-b-2 bg-gray-200 text-center">
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
                          >
                            <div
                              className={cn(
                                'relative flex flex-col items-center justify-center text-table-header',
                                {
                                  'px-3': headerGroup.headers.length > 8,
                                },
                              )}
                            >
                              <div
                                onClick={() => {
                                  header.column.getToggleSortingHandler()
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </div>
                              <div className="absolute right-1 w-2 text-xl text-black">
                                {{
                                  asc: '↑',
                                  desc: '↓',
                                }[header.column.getIsSorted() as string] ??
                                  null}
                              </div>
                              {columnFilter.find(
                                item =>
                                  item.id === header.column.id &&
                                  item.isVisible,
                              ) ? (
                                <div>
                                  <Filter
                                    column={header.column}
                                    table={table}
                                  />
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </th>
                    )
                  })}
                  {refreshBtn ? (
                    <th className="flex h-9 cursor-pointer items-center justify-center">
                      <img src={refreshIcon} onClick={refresh} />
                    </th>
                  ) : null}
                  {filterBtnClassName && (
                    <>
                      <Popover>
                        <PopoverTrigger
                          onClick={e => e.stopPropagation()}
                          className="absolute right-8 top-1"
                          asChild
                        >
                          <Button
                            className="border-none shadow-none"
                            variant="trans"
                            size="square"
                            startIcon={
                              <img
                                src={btnFilterIcon}
                                alt=""
                                className="h-[36px] w-[24px]"
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
                                checked={
                                  columnFilter.filter(item => item.isVisible)
                                    .length === columnFilter.length
                                }
                                onChange={() => {
                                  setColumnFilter(
                                    columnFilter.map(item => {
                                      return {
                                        ...item,
                                        isVisible: !item.isVisible,
                                      }
                                    }),
                                  )
                                }}
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
                                  column.id !== 'stt' &&
                                  column.id !== 'select' &&
                                  column.id !== 'created_time',
                              )
                              .map(column => {
                                let title_column

                                if (
                                  column.columnDef &&
                                  typeof column.columnDef.header === 'function'
                                ) {
                                  const headerResult = column.columnDef.header()
                                  if (
                                    typeof headerResult?.props?.children ===
                                    'string'
                                  ) {
                                    title_column = headerResult?.props?.children
                                  } else if (
                                    typeof headerResult?.props?.children ===
                                    'object'
                                  ) {
                                    title_column =
                                      headerResult?.props?.children[0].props
                                        ?.children
                                  } else {
                                    title_column = ''
                                  }
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
                                        checked={
                                          columnFilter.find(
                                            item => item.id === column.id,
                                          )?.isVisible
                                        }
                                        onChange={() => {
                                          setColumnFilter(
                                            columnFilter.map(item => {
                                              if (item.id === column.id) {
                                                return {
                                                  ...item,
                                                  isVisible: !item.isVisible,
                                                }
                                              }
                                              return item
                                            }),
                                          )
                                        }}
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
                  )}
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
                                    typeof headerResult?.props?.children ===
                                    'string'
                                  ) {
                                    title_column = headerResult?.props?.children
                                  } else if (
                                    typeof headerResult?.props?.children ===
                                    'object'
                                  ) {
                                    title_column =
                                      headerResult?.props?.children[0].props
                                        ?.children
                                  } else {
                                    title_column = ''
                                  }
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
              {isRefresh ? (
                <td colSpan={999} rowSpan={0}>
                  <div className="flex h-full items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                </td>
              ) : totalAttrs > 0 ? (
                table.getRowModel().rows.map(row => {
                  return (
                    <Fragment key={row.id}>
                      <tr
                        className="border-secondary-70 cursor-pointer border-t-2 text-center hover:bg-primary-300 hover:bg-opacity-25"
                        key={row.id}
                      >
                        {row.getVisibleCells().map((cell, index) => {
                          if (index === row.getVisibleCells().length - 1) {
                            return (
                              <Fragment key={cell.id}>
                                <td
                                  className={`h-9`}
                                  key={cell.id}
                                  onClick={() => {
                                    if (
                                      projectId &&
                                      cell.column.id !== 'contextMenu' &&
                                      cell.column.id !== 'select'
                                    ) {
                                      const linkId = row.original.id
                                      console.log('orgId', orgId)
                                      navigate(
                                        `${navigateToDetailNoOrg ? `${path}/${projectId}/${linkId}` : `${path}/${projectId}/${orgId != null ? `${orgId}/${linkId}` : ` /${linkId}`}`}`,
                                      )
                                    }
                                  }}
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </td>
                              </Fragment>
                            )
                          } else {
                            return (
                              <td
                                className="h-9"
                                key={cell.id}
                                onClick={() => {
                                  if (
                                    projectId &&
                                    cell.column.id !== 'contextMenu' &&
                                    cell.column.id !== 'select'
                                  ) {
                                    const linkId = row.original.id
                                    console.log('orgId', orgId)
                                    navigate(
                                      `${navigateToDetailNoOrg ? `${path}/${projectId}/${linkId}` : `${path}/${projectId}/${orgId != null ? `${orgId}/${linkId}` : ` /${linkId}`}`}`,
                                    )
                                  }
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </td>
                            )

                            // // Tooltips all cell but some case can not
                            // const cellStr = cell.getContext().getValue()
                            // let cellStrTrigger
                            // if (typeof cellStr == 'string') {
                            //   cellStrTrigger =
                            //     cellStr?.length > 10
                            //       ? cellStr.slice(0, 10) + '...'
                            //       : cellStr
                            // }
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
                })
              ) : (
                <td colSpan={999} className="py-[150px] text-center">
                  {onDataText || t('error:no_data')}
                </td>
              )}
            </tbody>
          </table>
        </>
      )}
      {totalAttrs > 0 && (
        <PaginationRender
          totalAttrs={totalAttrs}
          limitPagination={limitPagination}
          offset={offset}
          setOffset={setOffset}
          isPreviousData={isPreviousData}
          table={table}
          isAbsoluteBtn={isAbsoluteBtn}
          setPageSize={table.setPageSize}
          tableIndex={tableIndex}
        />
      )}
    </div>
  )
}
