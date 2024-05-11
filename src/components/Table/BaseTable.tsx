import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
  type ColumnFiltersState,
  type FilterFn,
  getFilteredRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import {
  LuFilter,
  LuSettings,
  LuEye,
  LuTrash2,
  LuPenSquare,
  LuView,
} from 'react-icons/lu'
import { Button } from '../ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'

import { cn } from '@/utils/misc'
import { PaginationRender } from './Pagination'
import { limitPagination } from '@/utils/const'
import { ExportTable } from './ExportTable'
import { useSpinDelay } from 'spin-delay'

export type BaseTableProps<T extends Record<string, any>> = {
  data: T[]
  columns: ColumnDef<T, any>[]
  offset: number
  setOffset: React.Dispatch<React.SetStateAction<number>>
  total?: number
  isPreviousData: boolean
  isLoading: boolean
  className?: string
  renderSubComponent?: (row: Row<T>) => React.ReactNode
  getRowCanExpand?: (row: Row<T>) => boolean
  colsVisibility?: VisibilityState
  popoverClassName?: string
  isAbsoluteBtn?: boolean
  onDataText?: string
  refreshBtn?: boolean
  rowSelection?: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
  formatExcel?: Array<{ [key: string]: unknown }>
  filterBtnClassName?: string
  isCheckbox?: boolean
  utilityButton?: React.ReactNode
  deleteSelected?: () => void
  isSearchData?: boolean
  limit?: number
  viewDetailOnClick?: (id: string) => void
  pdfHeader?: string[]
}

export function BaseTable<T extends Record<string, any>>({
  data = [],
  columns,
  offset = 0,
  setOffset,
  total,
  isPreviousData,
  isLoading,
  className,
  renderSubComponent,
  getRowCanExpand,
  colsVisibility = {},
  popoverClassName = 'absolute right-0 top-[-40px] hidden',
  isAbsoluteBtn = true,
  onDataText,
  rowSelection = {},
  setRowSelection,
  formatExcel = [],
  filterBtnClassName = 'absolute top-[-20px] right-0 z-50',
  isCheckbox = true,
  utilityButton,
  deleteSelected,
  isSearchData,
  limit = limitPagination,
  viewDetailOnClick,
  pdfHeader,
}: BaseTableProps<T>) {
  const { t } = useTranslation()
  const ref = useRef(null)

  const tableIndex = useRef(0)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(colsVisibility)

  function addCheckbox() {
    columns.unshift({
      id: 'select',
      header: ({ table }) => (
        <div className="flex cursor-pointer justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={value => {
              // table.toggleAllRowsSelected(!!value)
              table.toggleAllPageRowsSelected(!!value)
            }}
            aria-label="Select all"
            className="h-4 w-4"
            classNameCheck="h-4 w-4"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex cursor-pointer justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={value => {
              row.toggleSelected(!!value)
            }}
            className="h-4 w-4"
            classNameCheck="h-4 w-4"
          />
        </div>
      ),
    })
  }

  if (isCheckbox && !columns.find(col => col.id === 'select')) {
    addCheckbox()
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
    // enableRowSelection: true, //enable row selection for all rows
    onRowSelectionChange: setRowSelection,
    getRowId: row => (row.id ? row.id : row.user_id),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })
  const totalAttributes = total || data?.length

  useEffect(() => {
    setTimeout(() => {
      if (isSearchData) {
        setOffset && setOffset(0)
        table.setPageIndex(0)
        tableIndex.current = 0
      } else {
        table.setPageIndex(
          tableIndex.current - offset / table.getState().pagination.pageSize,
        )
      }
    }, 1)
  }, [data])

  const showProgress = useSpinDelay(isLoading, {
    delay: 500,
    minDuration: 100,
  })

  return (
    <div className={cn('', className)}>
      <div className="flex w-full flex-col gap-4 font-bold md:flex-row md:items-center md:justify-end">
        <div className="flex flex-row gap-4">
          {utilityButton}
          <ExportTable
            refComponent={ref}
            rowSelection={rowSelection}
            formatExcel={formatExcel}
            pdfHeader={pdfHeader}
          />
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <LuSettings className="h-[25px] w-[25px] cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* filter all */}
              <DropdownMenuCheckboxItem
                id="checkAll"
                className="cursor-pointer capitalize"
                checked={table.getIsAllColumnsVisible()}
                onCheckedChange={table.getToggleAllColumnsVisibilityHandler()}
              >
                {t('table:filter.select_all')}
              </DropdownMenuCheckboxItem>

              {table
                .getAllColumns()
                .filter(col => {
                  if (
                    col.id !== 'stt' &&
                    col.id !== 'contextMenu' &&
                    col.id !== 'select'
                  ) {
                    return col
                  }
                })
                .map(column => {
                  let title_column
                  if (
                    column.columnDef &&
                    typeof column.columnDef.header === 'function'
                  ) {
                    const headerResult = column.columnDef.header()
                    if (typeof headerResult?.props?.children === 'string') {
                      title_column = headerResult?.props?.children
                    } else if (
                      typeof headerResult?.props?.children === 'object'
                    ) {
                      title_column =
                        headerResult?.props?.children[0].props?.children
                    } else {
                      title_column = ''
                    }
                  } else {
                    title_column = ''
                  }

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="cursor-pointer capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={value =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {title_column}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ScrollArea
        className={cn(
          'relative z-30 mt-2 flex h-[calc(100vh_-_370px)] grow flex-col justify-between',
          className,
        )}
      >
        {isPreviousData && offset == 0 ? null : (
          <>
            <Table
              ref={ref}
              className={cn({
                'h-[90%]': totalAttributes === 0,
              })}
              id="table-ref"
            >
              <Progress isLoading={showProgress} />
              <TableHeader className="sticky top-px z-50 shadow-table-header">
                {table.getHeaderGroups().map(headerGroup => {
                  return (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => {
                        return (
                          <TableHead
                            key={header.id}
                            className={cn(
                              'bg-[#FAFAFC] text-[#2F2B3D]',
                              header.id === 'select'
                                ? 'py-0 pl-[20px]'
                                : header.id === 'contextMenu'
                                  ? 'px-[32px]'
                                  : 'min-w-[80px] truncate overflow-ellipsis whitespace-nowrap break-words px-0 text-left text-sm',
                            )}
                          >
                            {header.id === 'contextMenu' && t('table:action')}
                            <div
                              className={cn(
                                header.id !== 'contextMenu' &&
                                  header.id !== 'select' &&
                                  'border-l border-[#2F2B3D] px-5 font-bold',
                              )}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </div>
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableHeader>
              <TableBody>
                {totalAttributes > 0 ? (
                  table.getRowModel().rows.map((row, index) => {
                    const linkId = row.original.id
                    return (
                      <TableRow
                        key={row.id}
                        className={cn(
                          'box-border',
                          index % 2 === 1 ? 'bg-[#F9F9F9]' : 'bg-white',
                          viewDetailOnClick &&
                            'cursor-pointer hover:bg-primary-100',
                        )}
                      >
                        {row.getVisibleCells().map((cell, index) => {
                          const cellContent = flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                          return (
                            <TableCell
                              key={index}
                              className="h-[30px] max-h-[30px] min-w-[80px] truncate whitespace-nowrap break-words px-5 py-0 text-left"
                              onClick={
                                cell.column.id !== 'contextMenu' &&
                                cell.column.id !== 'select'
                                  ? viewDetailOnClick
                                    ? () => viewDetailOnClick(linkId)
                                    : undefined
                                  : undefined
                              }
                            >
                              {cellContent}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={999} className="h-[350px] text-center">
                      {showProgress && t('table:loading')}
                      {!isLoading && (onDataText || t('error:no_data'))}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {totalAttributes >= 0 && (
        <PaginationRender
          totalAttrs={totalAttributes}
          limitPagination={limit}
          offset={offset}
          setOffset={setOffset}
          isPreviousData={isPreviousData}
          table={table}
          isAbsoluteBtn={isAbsoluteBtn}
          setPageSize={table.setPageSize}
          tableIndex={tableIndex}
          isSearchData={isSearchData}
        />
      )}
    </div>
  )
}
