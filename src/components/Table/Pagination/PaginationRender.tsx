import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { DropdownPageLimit } from './DropdownPageLimit'
import { Pagination } from './Pagination'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

type PaginationRenderProps = {
  totalAttrs: number
  limitPagination: number
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  countLimitPaginationRef?: any
  isPreviousData: boolean
  table?: any
  isAbsoluteBtn?: boolean
  setPageSize?: React.Dispatch<React.SetStateAction<number>>
  tableIndex: React.MutableRefObject<number>
  isSearchData?: boolean
}

export function PaginationRender({
  totalAttrs,
  limitPagination,
  page,
  setPage,
  isPreviousData,
  table,
  setPageSize,
  tableIndex,
  isSearchData,
}: PaginationRenderProps) {
  const { t } = useTranslation()

  const { pageSize } = table.getState().pagination

  const [pageIndex, setPageIndex] = useState<number>(0)

  useEffect(() => {
    tableIndex.current = pageIndex
  }, [pageIndex])

  useEffect(() => {
    setPageIndex(0)
  }, [isSearchData])

  return (
    <ScrollArea className="overflow-y-hidden">
      <div className="flex w-full flex-col justify-between gap-4 px-2 py-1 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex w-[100px] items-center justify-center whitespace-nowrap text-sm text-muted-foreground">
          {t('table:pagination')}
        </div>
        <DropdownPageLimit table={table} />
        <div className="flex-1 whitespace-nowrap text-sm text-muted-foreground">
          {t('table:paginationSelected', {
            min:
              pageIndex * pageSize > totalAttrs ? 1 : pageIndex * pageSize + 1,
            max:
              (pageIndex + 1) * pageSize > totalAttrs
                ? totalAttrs
                : (pageIndex + 1) * pageSize,
            total: totalAttrs,
          })}
        </div>
        <div className="flex flex-row items-center gap-4 lg:gap-8">
          <div className="flex items-center space-x-4">
            <Button
              className="hidden h-8 w-8 border-none px-[12px] py-[8px] lg:flex"
              onClick={() => {
                setPage?.(page - 1)
                setPageIndex(prev => prev - 1)
                setTimeout(() => {
                  table.setPageIndex(pageIndex - 1)
                }, 1)
              }}
              disabled={pageIndex === 0 || isPreviousData}
              // variant="secondaryLight"
              variant="outline"
            >
              <LuChevronLeft className="h-4 w-4" />
            </Button>
            <Pagination
              currentPage={pageIndex}
              totalCount={totalAttrs}
              pageSize={pageSize}
              table={table}
              setCurrentPage={setPageIndex}
              setPage={setPage}
              page={page}
            />
            <Button
              className="hidden h-8 w-8 border-none px-[12px] py-[8px] lg:flex"
              onClick={() => {
                if (
                  limitPagination < totalAttrs &&
                  offsetCalc >= limitPagination
                ) {
                  setOffset?.(offsetCalc)
                }
                setPageIndex(prev => prev + 1)
                table.setPageIndex(pageIndex + 1 - offsetCalc / pageSize)
              }}
              disabled={
                (pageIndex + 1) * pageSize >= totalAttrs || isPreviousData
              }
              variant="outline"
            >
              <LuChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
