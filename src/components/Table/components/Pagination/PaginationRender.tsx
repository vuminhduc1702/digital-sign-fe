import Pagination from './Pagination'
import { Button } from '../../../Button'
import { cn } from '~/utils/misc'
import { useTranslation } from 'react-i18next'

import { useState } from 'react'

import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'

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
}: PaginationRenderProps) {
  const { t } = useTranslation()

  const { pageSize } = table.getState().pagination

  const [pageIndex, setPageIndex] = useState(0)

  return (
    <div className="relative mt-3 flex items-center justify-between gap-2">
      <div
        className={cn('flex flex-col', {
          'absolute bottom-4': isAbsoluteBtn,
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
          'absolute bottom-4 right-0': isAbsoluteBtn,
        })}
      >
        <Button
          className="rounded-l-md border-none"
          onClick={() => {
            if (
              limitPagination < totalAttrs &&
              offset / limitPagination > 0 &&
              offset / limitPagination <= pageIndex &&
              (pageIndex - 1) * pageSize <= limitPagination
            ) {
              setOffset?.(offset => offset - limitPagination)
              setPageIndex(prev => prev - 1)
              setTimeout(() => {
                table.setPageIndex(pageIndex - offset / limitPagination - 1)
              }, 1)
            } else {
              setPageIndex(prev => prev - 1)
              table.setPageIndex(pageIndex - 1)
            }
          }}
          disabled={pageIndex === 0 || isPreviousData}
          variant="secondaryLight"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <Pagination
          currentPage={pageIndex}
          totalCount={totalAttrs}
          pageSize={pageSize}
          table={table}
          setCurrentPage={setPageIndex}
        />
        <Button
          className="rounded-r-md border-none"
          onClick={() => {
            if (
              limitPagination < totalAttrs &&
              (pageIndex + 1) * pageSize >= limitPagination
            ) {
              setOffset?.(offset => offset + limitPagination)
            }
            setPageIndex(prev => prev + 1)
            table.setPageIndex(pageIndex + 1)
          }}
          disabled={(pageIndex + 1) * pageSize >= totalAttrs || isPreviousData}
          variant="secondaryLight"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
