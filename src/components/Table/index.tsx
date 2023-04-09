import { useQuery } from '@tanstack/react-query'
import {
  type PaginationState,
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Pagination from './components/Pagination'
import { Button } from '../Button'

import { type OrgAttr } from '~/layout/MainLayout/types'

function Table({
  columns,
  data,
  dataQueryKey,
  contextBtn,
}: {
  columns: ColumnDef<OrgAttr, string>[]
  data: OrgAttr[]
  dataQueryKey: string
  contextBtn: React.ReactElement
}) {
  const { t } = useTranslation()

  const totalAttr = data?.length

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const fetchDataOptions = {
    pageIndex,
    pageSize,
  }

  function fetchTableData(
    data: OrgAttr[],
    options: {
      pageIndex: number
      pageSize: number
    },
  ) {
    return {
      rows:
        data?.slice(
          options.pageIndex * options.pageSize,
          (options.pageIndex + 1) * options.pageSize,
        ) ?? [],
      pageCount: Math.ceil(data?.length / options.pageSize) ?? 0,
    }
  }

  const dataQuery = useQuery({
    queryKey: [dataQueryKey, fetchDataOptions],
    queryFn: () => fetchTableData(data, fetchDataOptions),
    keepPreviousData: true,
    enabled: !!data,
  })

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
                            <td>{contextBtn}</td>
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
            {dataQuery.isFetching ? t('loading') : null}
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
