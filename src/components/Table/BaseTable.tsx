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
} from '~/components/ui/table'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '~/components/ui/popover'
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
import { Checkbox } from '~/components/ui/checkbox'
import { Progress } from '~/components/ui/progress'

import { cn } from '~/utils/misc'
import { PaginationRender } from './Pagination'
import { limitPagination } from '~/utils/const'
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
  viewDetailOnClick?: (row: Row<T>) => void
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
        setOffset(0)
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
    delay: 3000,
    minDuration: 100,
  })

  return (
    <div className={cn('', className)}>
      <div
        ref={ref}
        className="flex w-full flex-col gap-4 font-bold md:flex-row md:items-center md:justify-between"
      >
        <div className="flex flex-row gap-4">
          <ExportTable
            refComponent={ref}
            rowSelection={rowSelection}
            formatExcel={formatExcel}
            pdfHeader={pdfHeader}
          />
          {utilityButton}
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <LuSettings className="h-[25px] w-[25px] cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              {/* filter all */}
              <DropdownMenuCheckboxItem
                id="checkAll"
                className="cursor-pointer capitalize"
                checked={table.getIsAllColumnsVisible()}
                onCheckedChange={() => {
                  table.getAllColumns().filter(col => {
                    if (
                      col.id !== 'stt' &&
                      col.id !== 'contextMenu' &&
                      col.id !== 'select'
                    ) {
                      return col
                    }
                  })
                }}
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
          {/* {t('table:searchCount')} {'('}
          {totalAttributes || 0}
          {')'}
          {Object.keys(rowSelection).length > 0 && (
            <span>
              {' '}
              - {t('table:selectCount')} {'('}
              {Object.keys(rowSelection).length || 0}
              {')'}
            </span>
          )} */}
        </div>
      </div>
      <div className="mt-2 h-[76vh] overflow-x-auto">
        <ScrollArea>
          <div
            className={cn(
              'z-30flex relative grow flex-col justify-between overflow-hidden',
              className,
            )}
          >
            {isPreviousData && offset == 0 ? (
              <></>
            ) : (
              <>
                <Table
                  className={cn({
                    'h-[90%]': totalAttributes === 0,
                  })}
                  id="table-ref"
                >
                  <Progress isLoading={showProgress} />
                  <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => {
                      return (
                        <TableRow key={headerGroup.id} className="">
                          {headerGroup.headers.map(header => {
                            return (
                              <TableHead
                                key={header.id}
                                className={cn(
                                  '',
                                  header.id === 'select'
                                    ? 'py-0 pl-[8px]'
                                    : header.id === 'edit' ||
                                        header.id === 'view' ||
                                        header.id === 'delete'
                                      ? '!h-9 !w-10'
                                      : '!min-w-[80px] !overflow-hidden !truncate !overflow-ellipsis !whitespace-nowrap !break-words !bg-white px-2 !text-left !text-sm !text-black',
                                )}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </TableHead>
                            )
                          })}
                        </TableRow>
                      )
                    })}
                  </TableHeader>
                  <TableBody>
                    {totalAttributes > 0 ? (
                      table.getRowModel().rows.map(row => {
                        return (
                          <TableRow
                            key={row.id}
                            className="box-border"
                            onClick={
                              viewDetailOnClick
                                ? () => viewDetailOnClick(row)
                                : undefined
                            }
                          >
                            {row.getVisibleCells().map((cell, index) => {
                              const cellContent = flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )
                              return (
                                <TableCell
                                  key={index}
                                  className="h-[30px] max-h-[30px] !min-w-[80px] !overflow-hidden !truncate !whitespace-nowrap !break-words px-2 py-0 text-left"
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
                        <TableCell colSpan={999} className="text-center">
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
          </div>
        </ScrollArea>
      </div>

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

// import {
//   useReactTable,
//   getCoreRowModel,
//   flexRender,
//   type ColumnDef,
//   getPaginationRowModel,
//   getSortedRowModel,
//   type SortingState,
//   type Row,
//   getExpandedRowModel,
//   type VisibilityState,
//   type FilterFn,
//   getFilteredRowModel,
//   getFacetedUniqueValues,
//   getFacetedMinMaxValues,
// } from '@tanstack/react-table'
// import { Fragment, type HTMLProps, useEffect, useRef, useState } from 'react'
// import { useTranslation } from 'react-i18next'
// import { rankItem } from '@tanstack/match-sorter-utils'

// import { Button } from '../Button'
// import { limitPagination } from '~/utils/const'
// import { Spinner } from '../Spinner'
// import { cn } from '~/utils/misc'
// import { SettingIcon } from '~/components/SVGIcons'
// import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
// import PaginationRender from './components/Pagination/PaginationRender'
// import Filter from './components/FilterTable/Filter'

// import refreshIcon from '~/assets/icons/table-refresh.svg'
// import btnFilterIcon from '~/assets/icons/btn-filter.svg'
// import { useNavigate } from 'react-router-dom'

// const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
//   // Rank the item
//   const itemRank = rankItem(row.getValue(columnId), value)

//   // Store the itemRank info
//   addMeta({
//     itemRank,
//   })

//   // Return if the item should be filtered in/out
//   return itemRank.passed
// }

// function IndeterminateCheckbox({
//   indeterminate,
//   className = '',
//   ...rest
// }: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
//   const ref = useRef<HTMLInputElement>(null!)

//   useEffect(() => {
//     if (typeof indeterminate === 'boolean' && ref.current) {
//       ref.current.indeterminate = !rest.checked && indeterminate
//     }
//   }, [ref, indeterminate])

//   return (
//     <input
//       style={{
//         accentColor: '#e74c3c',
//       }}
//       type="checkbox"
//       ref={ref}
//       className={className + ' cursor-pointer'}
//       {...rest}
//     />
//   )
// }

// export function BaseTable<T extends Record<string, any>>({
//   data = [],
//   columns,
//   offset = 0,
//   setOffset,
//   total,
//   isPreviousData,
//   className,
//   renderSubComponent,
//   getRowCanExpand,
//   colsVisibility = {},
//   popoverClassName = 'absolute right-0 top-1 hidden',
//   isAbsoluteBtn = true,
//   onDataText,
//   refreshBtn,
//   callbackParent,
//   rowSelection = {},
//   setRowSelection,
//   isHiddenCheckbox = false,
//   filterBtnClassName = 'absolute top-10 right-0',
//   path,
//   projectId,
//   orgId,
// }: {
//   data: T[]
//   columns: ColumnDef<T, string>[]
//   offset?: number
//   setOffset?: React.Dispatch<React.SetStateAction<number>>
//   total?: number
//   isPreviousData?: boolean
//   className?: string
//   renderSubComponent?: (props: { row: Row<T> }) => React.ReactElement
//   getRowCanExpand?: (row: Row<T>) => boolean
//   colsVisibility?: VisibilityState
//   popoverClassName?: string
//   isAbsoluteBtn?: boolean
//   onDataText?: string
//   refreshBtn?: boolean
//   callbackParent?: () => void
//   rowSelection: { [key: string]: boolean }
//   setRowSelection: React.Dispatch<
//     React.SetStateAction<{ [key: string]: boolean }>
//   >
//   isHiddenCheckbox?: boolean
//   filterBtnClassName?: string
//   path?: string
//   projectId?: string
//   orgId?: string
// }) {
//   const { t } = useTranslation()
//   const navigate = useNavigate()

//   const [sorting, setSorting] = useState<SortingState>([])
//   const [columnVisibility, setColumnVisibility] = useState(colsVisibility)
//   const [isRefresh, setIsRefresh] = useState(false)
//   const tableIndex = useRef(0)

//   if (!isHiddenCheckbox && !columns.some(column => column.id === 'select')) {
//     columns.unshift({
//       id: 'select',
//       header: info => (
//         <IndeterminateCheckbox
//           {...{
//             checked: info?.table.getIsAllRowsSelected(),
//             indeterminate: info?.table.getIsSomeRowsSelected(),
//             onChange: info?.table.getToggleAllRowsSelectedHandler(),
//           }}
//         />
//       ),
//       cell: ({ row }) => (
//         <div className="px-1">
//           <IndeterminateCheckbox
//             {...{
//               checked: row.getIsSelected(),
//               disabled: !row.getCanSelect(),
//               indeterminate: row.getIsSomeSelected(),
//               onChange: row.getToggleSelectedHandler(),
//             }}
//           />
//         </div>
//       ),
//     })
//   }

//   const table = useReactTable({
//     data,
//     columns,
//     state: {
//       sorting,
//       columnVisibility,
//       rowSelection,
//     },
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     debugTable: true,
//     getRowCanExpand,
//     onColumnVisibilityChange: setColumnVisibility,
//     getExpandedRowModel: getExpandedRowModel(),
//     enableRowSelection: true, //enable row selection for all rows
//     onRowSelectionChange: setRowSelection,
//     getRowId: row => (row.id ? row.id : row.user_id),
//     filterFns: {
//       fuzzy: fuzzyFilter,
//     },
//     globalFilterFn: fuzzyFilter,
//     getFilteredRowModel: getFilteredRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getFacetedMinMaxValues: getFacetedMinMaxValues(),
//   })
//   const totalAttrs = total || data?.length
//   const [columnFilter, setColumnFilter] = useState(
//     table
//       .getAllLeafColumns()
//       .filter(col => {
//         if (
//           col.id !== 'stt' &&
//           col.id !== 'contextMenu' &&
//           col.id !== 'select' &&
//           col.id !== 'created_time'
//         ) {
//           return col
//         }
//       })
//       .map(col => {
//         return {
//           id: col.id,
//           isVisible: false,
//         }
//       }),
//   )

//   function refresh() {
//     setIsRefresh(true)
//     callbackParent?.()
//     setTimeout(() => {
//       setIsRefresh(false)
//     }, 500)
//   }

//   useEffect(() => {
//     setTimeout(() => {
//       table.setPageIndex(
//         tableIndex.current - offset / table.getState().pagination.pageSize,
//       )
//     }, 1)
//   }, [data])

//   return (
//     <div
//       className={cn(
//         'mt-2 flex grow flex-col justify-between overflow-x-auto',
//         className,
//       )}
//     >
//       {isPreviousData && offset == 0 ? (
//         <div className="flex grow items-center justify-center">
//           <Spinner showSpinner size="xl" />
//         </div>
//       ) : (
//         <>
//           <table
//             className={cn('w-full border-2', { 'h-[90%]': totalAttrs === 0 })}
//             id="table-ref"
//           >
//             <thead className="border-b-2 bg-gray-200 text-center">
//               {table.getHeaderGroups().map(headerGroup => (
//                 <tr key={headerGroup.id}>
//                   {headerGroup.headers.map(header => {
//                     return (
//                       <th
//                         className="h-9 text-center"
//                         key={header.id}
//                         colSpan={header.colSpan}
//                       >
//                         {header.isPlaceholder ? null : (
//                           <div
//                             className={`text-table-header ${
//                               header.column.getCanSort()
//                                 ? 'cursor-pointer select-none'
//                                 : ''
//                             }`}
//                           >
//                             <div
//                               className={cn(
//                                 'relative flex flex-col items-center justify-center text-table-header',
//                                 {
//                                   'px-3': headerGroup.headers.length > 8,
//                                 },
//                               )}
//                             >
//                               <div
//                                 onClick={() => {
//                                   header.column.getToggleSortingHandler()
//                                 }}
//                               >
//                                 {flexRender(
//                                   header.column.columnDef.header,
//                                   header.getContext(),
//                                 )}
//                               </div>
//                               <div className="absolute right-1 w-2 text-xl text-black">
//                                 {{
//                                   asc: '↑',
//                                   desc: '↓',
//                                 }[header.column.getIsSorted() as string] ??
//                                   null}
//                               </div>
//                               {columnFilter.find(
//                                 item =>
//                                   item.id === header.column.id &&
//                                   item.isVisible,
//                               ) ? (
//                                 <div>
//                                   <Filter
//                                     column={header.column}
//                                     table={table}
//                                   />
//                                 </div>
//                               ) : null}
//                             </div>
//                           </div>
//                         )}
//                       </th>
//                     )
//                   })}
//                   {refreshBtn ? (
//                     <th className="flex h-9 cursor-pointer items-center justify-center">
//                       <img src={refreshIcon} onClick={refresh} />
//                     </th>
//                   ) : null}
//                   {filterBtnClassName && (
//                     <>
//                       <Popover>
//                         <PopoverTrigger
//                           onClick={e => e.stopPropagation()}
//                           className="absolute right-8 top-1"
//                           asChild
//                         >
//                           <Button
//                             className="border-none shadow-none"
//                             variant="trans"
//                             size="square"
//                             startIcon={
//                               <img
//                                 src={btnFilterIcon}
//                                 alt=""
//                                 className="h-[36px] w-[24px]"
//                               />
//                             }
//                           />
//                         </PopoverTrigger>
//                         <PopoverContent
//                           className="h-72 w-40 overflow-auto"
//                           align="start"
//                         >
//                           <div className="absolute top-0 border-b border-black bg-white px-1 pt-2">
//                             <label htmlFor="checkAll">
//                               <input
//                                 type="checkbox"
//                                 id="checkAll"
//                                 className="mr-1 h-4 w-4 rounded-sm border accent-primary-400"
//                                 checked={
//                                   columnFilter.filter(item => item.isVisible)
//                                     .length === columnFilter.length
//                                 }
//                                 onChange={() => {
//                                   setColumnFilter(
//                                     columnFilter.map(item => {
//                                       return {
//                                         ...item,
//                                         isVisible: !item.isVisible,
//                                       }
//                                     }),
//                                   )
//                                 }}
//                               />
//                               {t(
//                                 'cloud:org_manage.device_manage.table.select_all',
//                               )}
//                             </label>
//                           </div>

//                           <div className="mt-4">
//                             {table
//                               .getAllLeafColumns()
//                               .filter(
//                                 column =>
//                                   column.id !== 'contextMenu' &&
//                                   column.id !== 'stt' &&
//                                   column.id !== 'select' &&
//                                   column.id !== 'created_time',
//                               )
//                               .map(column => {
//                                 let title_column

//                                 if (
//                                   column.columnDef &&
//                                   typeof column.columnDef.header === 'function'
//                                 ) {
//                                   const headerResult = column.columnDef.header()
//                                   if (
//                                     typeof headerResult?.props?.children ===
//                                     'string'
//                                   ) {
//                                     title_column = headerResult?.props?.children
//                                   } else if (
//                                     typeof headerResult?.props?.children ===
//                                     'object'
//                                   ) {
//                                     title_column =
//                                       headerResult?.props?.children[0].props
//                                         ?.children
//                                   } else {
//                                     title_column = ''
//                                   }
//                                 } else {
//                                   title_column = ''
//                                 }

//                                 return (
//                                   <div key={column.id} className="p-1">
//                                     <label htmlFor={column.id}>
//                                       <input
//                                         type="checkbox"
//                                         id={column.id}
//                                         className="mr-1 h-4 w-4 rounded-sm border accent-primary-400"
//                                         checked={
//                                           columnFilter.find(
//                                             item => item.id === column.id,
//                                           )?.isVisible
//                                         }
//                                         onChange={() => {
//                                           setColumnFilter(
//                                             columnFilter.map(item => {
//                                               if (item.id === column.id) {
//                                                 return {
//                                                   ...item,
//                                                   isVisible: !item.isVisible,
//                                                 }
//                                               }
//                                               return item
//                                             }),
//                                           )
//                                         }}
//                                       />
//                                       {title_column}
//                                     </label>
//                                   </div>
//                                 )
//                               })}
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </>
//                   )}
//                   {popoverClassName !== '' ? (
//                     <>
//                       <Popover>
//                         <PopoverTrigger
//                           onClick={e => e.stopPropagation()}
//                           className={popoverClassName}
//                           asChild
//                         >
//                           <Button
//                             className="border-none shadow-none"
//                             variant="trans"
//                             size="square"
//                             startIcon={
//                               <SettingIcon
//                                 className="h-9"
//                                 height={24}
//                                 width={24}
//                                 viewBox="0 0 48 48"
//                               />
//                             }
//                           />
//                         </PopoverTrigger>
//                         <PopoverContent
//                           className="h-72 w-40 overflow-auto"
//                           align="start"
//                         >
//                           <div className="absolute top-0 border-b border-black bg-white px-1 pt-2">
//                             <label htmlFor="checkAll">
//                               <input
//                                 type="checkbox"
//                                 id="checkAll"
//                                 className="mr-1 h-4 w-4 rounded-sm border accent-primary-400"
//                                 checked={table.getIsAllColumnsVisible()}
//                                 onChange={table.getToggleAllColumnsVisibilityHandler()}
//                               />
//                               {t(
//                                 'cloud:org_manage.device_manage.table.select_all',
//                               )}
//                             </label>
//                           </div>

//                           <div className="mt-4">
//                             {table
//                               .getAllLeafColumns()
//                               .filter(
//                                 column =>
//                                   column.id !== 'contextMenu' &&
//                                   column.id !== 'stt',
//                               )
//                               .map(column => {
//                                 let title_column

//                                 if (
//                                   column.columnDef &&
//                                   typeof column.columnDef.header === 'function'
//                                 ) {
//                                   const headerResult = column.columnDef.header()
//                                   if (
//                                     typeof headerResult?.props?.children ===
//                                     'string'
//                                   ) {
//                                     title_column = headerResult?.props?.children
//                                   } else if (
//                                     typeof headerResult?.props?.children ===
//                                     'object'
//                                   ) {
//                                     title_column =
//                                       headerResult?.props?.children[0].props
//                                         ?.children
//                                   } else {
//                                     title_column = ''
//                                   }
//                                 } else {
//                                   title_column = ''
//                                 }

//                                 return (
//                                   <div key={column.id} className="p-1">
//                                     <label htmlFor={column.id}>
//                                       <input
//                                         type="checkbox"
//                                         id={column.id}
//                                         className="mr-1 h-4 w-4 rounded-sm border accent-primary-400"
//                                         checked={column.getIsVisible()}
//                                         onChange={column.getToggleVisibilityHandler()}
//                                       />
//                                       {title_column}
//                                     </label>
//                                   </div>
//                                 )
//                               })}
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </>
//                   ) : null}
//                 </tr>
//               ))}
//             </thead>
//             <tbody>
//               {isRefresh ? (
//                 <td colSpan={999} rowSpan={0}>
//                   <div className="flex h-full items-center justify-center">
//                     <Spinner size="lg" />
//                   </div>
//                 </td>
//               ) : totalAttrs > 0 ? (
//                 table.getRowModel().rows.map(row => {
//                   return (
//                     <Fragment key={row.id}>
//                       <tr
//                         className="border-secondary-70 cursor-pointer border-t-2 text-center hover:bg-primary-200"
//                         key={row.id}
//                       >
//                         {row.getVisibleCells().map((cell, index) => {
//                           if (index === row.getVisibleCells().length - 1) {
//                             return (
//                               <Fragment key={cell.id}>
//                                 <td
//                                   className={`h-9`}
//                                   key={cell.id}
//                                   onClick={() => {
//                                     if (
//                                       projectId &&
//                                       cell.column.id !== 'contextMenu' &&
//                                       cell.column.id !== 'select'
//                                     ) {
//                                       const linkId = row.original.id
//                                       navigate(
//                                         `${path}/${projectId}/${
//                                           orgId != null
//                                             ? `${orgId}/${linkId}`
//                                             : `${linkId}`
//                                         }`,
//                                       )
//                                     }
//                                   }}
//                                 >
//                                   {flexRender(
//                                     cell.column.columnDef.cell,
//                                     cell.getContext(),
//                                   )}
//                                 </td>
//                               </Fragment>
//                             )
//                           } else {
//                             return (
//                               <td
//                                 className="h-9"
//                                 key={cell.id}
//                                 onClick={() => {
//                                   if (
//                                     projectId &&
//                                     cell.column.id !== 'contextMenu' &&
//                                     cell.column.id !== 'select'
//                                   ) {
//                                     const linkId = row.original.id
//                                     navigate(
//                                       `${path}/${projectId}/${
//                                         orgId != null
//                                           ? `${orgId}/${linkId}`
//                                           : `${linkId}`
//                                       }`,
//                                     )
//                                   }
//                                 }}
//                               >
//                                 {flexRender(
//                                   cell.column.columnDef.cell,
//                                   cell.getContext(),
//                                 )}
//                               </td>
//                             )

//                             // Tooltips all cell but some case can not
//                             // const cellStr = cell.getContext().getValue()
//                             // let cellStrTrigger
//                             // if (typeof cellStr == 'string') {
//                             //   cellStrTrigger =
//                             //     cellStr?.length > 10
//                             //       ? cellStr.slice(0, 10) + '...'
//                             //       : cellStr
//                             // }
//                             // return typeof cellStr == 'string' &&
//                             //   cellStr != 'true' &&
//                             //   cellStr != 'false' &&
//                             //   isNaN(parseInt(cellStr)) ? (
//                             //   <td className="h-9 cursor-default" key={cell.id}>
//                             //     <TooltipProvider>
//                             //       <Tooltip>
//                             //         <TooltipTrigger>
//                             //           {cellStrTrigger}
//                             //         </TooltipTrigger>
//                             //         <TooltipContent>
//                             //           <p>
//                             //             {flexRender(
//                             //               cell.column.columnDef.cell,
//                             //               cell.getContext(),
//                             //             )}
//                             //           </p>
//                             //         </TooltipContent>
//                             //       </Tooltip>
//                             //     </TooltipProvider>
//                             //   </td>
//                             // ) : (
//                             //   <td className="h-9" key={cell.id}>
//                             //     {flexRender(
//                             //       cell.column.columnDef.cell,
//                             //       cell.getContext(),
//                             //     )}
//                             //   </td>
//                             // )
//                           }
//                         })}
//                       </tr>
//                       {row.getIsExpanded() && (
//                         <tr>
//                           {/* 2nd row is a custom 1 cell row */}
//                           <td colSpan={row.getVisibleCells().length}>
//                             {renderSubComponent?.({ row })}
//                           </td>
//                         </tr>
//                       )}
//                     </Fragment>
//                   )
//                 })
//               ) : (
//                 <td colSpan={999} className="py-[150px] text-center">
//                   {onDataText || t('error:no_data')}
//                 </td>
//               )}
//             </tbody>
//           </table>
//         </>
//       )}
//       {totalAttrs > 0 && (
//         <PaginationRender
//           totalAttrs={totalAttrs}
//           limitPagination={limitPagination}
//           offset={offset}
//           setOffset={setOffset}
//           isPreviousData={isPreviousData}
//           table={table}
//           isAbsoluteBtn={isAbsoluteBtn}
//           setPageSize={table.setPageSize}
//           tableIndex={tableIndex}
//         />
//       )}
//     </div>
//   )
// }
