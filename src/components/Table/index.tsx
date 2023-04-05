import { useQuery } from '@tanstack/react-query'
import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Pagination from './components/Pagination'

import { BtnContextMenuIcon } from '../SVGIcons'

function Table({
  columns,
  data,
  dataQueryKey,
}: {
  columns: any
  data: any
  dataQueryKey: string
}) {
  const { t } = useTranslation()

  const totalAttr = data?.attributes?.length

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const fetchDataOptions = {
    pageIndex,
    pageSize,
  }

  function fetchTableData(
    data: any,
    options: {
      pageIndex: number
      pageSize: number
    },
  ) {
    return {
      rows:
        data?.attributes?.slice(
          options.pageIndex * options.pageSize,
          (options.pageIndex + 1) * options.pageSize,
        ) ?? [],
      pageCount: Math.ceil(data?.attributes?.length / options.pageSize) ?? 0,
    }
  }

  const dataQuery = useQuery(
    [dataQueryKey, fetchDataOptions],
    () => fetchTableData(data, fetchDataOptions),
    { keepPreviousData: true, enabled: !!data },
  )

  const defaultData = useMemo(() => [], [])

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  )

  useEffect(() => {
    dataQuery.refetch()
  }, [data])

  const table = useReactTable({
    data: dataQuery.data?.rows ?? defaultData,
    columns,
    pageCount: dataQuery.data?.pageCount ?? -1,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    debugTable: true,
  })

  return (
    <>
      {dataQuery.data?.rows.length !== 0 ? (
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
                  <tr
                    className="border-secondary-70 group border-t-2"
                    key={row.id}
                  >
                    {row.getVisibleCells().map(cell => {
                      return (
                        <td className="h-11" key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      )
                    })}
                    <BtnContextMenuIcon
                      className="cursor-pointer text-secondary-700 hover:text-primary-400"
                      height={40}
                      width={3}
                      viewBox="0 -10 3 40"
                    />
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-3">
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
              <span className="flex items-center gap-1 text-body-light">
                {t('cloud.org_manage.org_info.table.show_in')
                  .replace(
                    '{{PAGE}}',
                    pageSize < totalAttr ? pageSize?.toString() : totalAttr,
                  )
                  .replace('{{TOTAL}}', totalAttr?.toString())}
              </span>
            </div>
            <div className="flex">
              <button
                className="cursor-pointer rounded border p-1"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'Prev'}
              </button>
              <Pagination
                currentPage={pageIndex}
                totalCount={totalAttr}
                pageSize={pageSize}
                table={table}
              />
              <button
                className="cursor-pointer rounded border p-1"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {'Next'}
              </button>
            </div>
            {dataQuery.isFetching ? 'Đang tải...' : null}
          </div>
        </div>
      ) : (
        <div className="flex grow items-center justify-center">
          {t('cloud.org_manage.org_info.table.no_attr')}
        </div>
      )}
    </>
  )
}

export default Table
