import { useQuery } from '@tanstack/react-query'
import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  console.log('dataQuery.data', dataQuery.data)

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
        <div className="mt-3 flex grow flex-col justify-between pl-11">
          <table>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <div>
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
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => {
                      return (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="flex items-center gap-2">
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                className="rounded border p-1"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<'}
              </button>
              <span className="flex items-center gap-1">
                <div>Page</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </strong>
              </span>
              <button
                className="rounded border p-1"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>'}
              </button>
            </div>
            {dataQuery.isFetching ? 'Loading...' : null}
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
