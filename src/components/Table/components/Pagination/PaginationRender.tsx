import Pagination from './Pagination'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/misc'
import { useTranslation } from 'react-i18next'

import { useEffect, useState } from 'react'

import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

import PageSizeLimit from './DropdownPageLimit'

type PaginationRenderProps = {
  totalAttrs: number
  limitPagination: number
  offset: number
  setOffset?: React.Dispatch<React.SetStateAction<number>>
  countLimitPaginationRef?: any
  isPreviousData?: boolean
  table?: any
  isAbsoluteBtn?: boolean
  setPageSize?: React.Dispatch<React.SetStateAction<number>>
  tableIndex: React.MutableRefObject<number>
}

export default function PaginationRender({
  totalAttrs,
  limitPagination,
  offset,
  setOffset,
  isPreviousData,
  table,
  isAbsoluteBtn,
  setPageSize,
  tableIndex,
}: PaginationRenderProps) {
  const { t } = useTranslation()

  const { pageSize } = table.getState().pagination

  const [pageIndex, setPageIndex] = useState<number>(0)

  useEffect(() => {
    tableIndex.current = pageIndex
  }, [pageIndex])

  return (
    <div className="flex h-[60px] items-center justify-between gap-2">
      <div
        className={cn('flex flex-col', {
          'absolute bottom-8': isAbsoluteBtn,
        })}
      >
        <div>
          <span className="flex items-center gap-1 text-body-light">
            {t('table:show_in')
              .replace(
                '{{PAGE}}',
                pageSize * (pageIndex + 1) < totalAttrs
                  ? (pageSize * (pageIndex + 1))?.toString()
                  : totalAttrs?.toString(),
              )
              .replace('{{TOTAL}}', totalAttrs?.toString())}
          </span>
        </div>
        <PageSizeLimit setPageSize={setPageSize} />
      </div>
      <div
        className={cn('flex gap-x-2', {
          'absolute bottom-8 right-[36px]': isAbsoluteBtn,
        })}
      >
        <Button
          className="rounded-l-md border-none"
          onClick={() => {
            const offsetCalc =
              Math.floor(((pageIndex - 1) * pageSize) / limitPagination) *
              limitPagination
            setOffset?.(offsetCalc)
            setPageIndex(prev => prev - 1)
            setTimeout(() => {
              table.setPageIndex(pageIndex - offsetCalc / pageSize - 1)
            }, 1)
          }}
          disabled={pageIndex === 0 || isPreviousData}
          variant="secondaryLight"
        >
          <LuChevronLeft className="h-4 w-4" />
        </Button>
        <Pagination
          currentPage={pageIndex}
          totalCount={totalAttrs}
          pageSize={pageSize}
          table={table}
          setCurrentPage={setPageIndex}
          setOffset={setOffset}
          offset={offset}
        />
        <Button
          className="rounded-r-md border-none"
          onClick={() => {
            const offsetCalc =
              Math.floor(((pageIndex + 1) * pageSize) / limitPagination) *
              limitPagination
            if (limitPagination < totalAttrs && offsetCalc >= limitPagination) {
              setOffset?.(offsetCalc)
            }
            setPageIndex(prev => prev + 1)
            table.setPageIndex(pageIndex + 1 - offsetCalc / pageSize)
          }}
          disabled={(pageIndex + 1) * pageSize >= totalAttrs || isPreviousData}
          variant="secondaryLight"
        >
          <LuChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
