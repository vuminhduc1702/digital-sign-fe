import { useMemo } from 'react'
import { type Table } from '@tanstack/react-table'

import { cn } from '~/utils/misc'
import { limitPagination } from '~/utils/const'
import {
  PaginationWrapper,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '~/components/ui/pagination'

const DOTS = '...'

export const Pagination = <T extends Record<string, any>>({
  table,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  setCurrentPage,
  setOffset,
  limit = limitPagination,
  offset,
}: {
  table: Table<T>
  totalCount: number
  siblingCount?: number
  currentPage: number
  pageSize: number
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>
  setOffset: React.Dispatch<React.SetStateAction<number>>
  limit?: number
  offset: number
}) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  })

  // If there are less than 2 times in pagination range we shall not render the component
  if (paginationRange && paginationRange.length < 2) {
    return null
  }

  return (
    <PaginationWrapper>
      <PaginationContent>
        {paginationRange?.map((pageNumber, index) => {
          // If the pageItem is a DOT, render the DOTS unicode character
          if (pageNumber === DOTS) {
            return <PaginationEllipsis key={index} />
          }

          // Render our Page Pills
          return typeof pageNumber === 'number' ? (
            <PaginationItem
              key={index}
              className={cn('rounded-full border-none text-black', {
                'bg-gray-300': pageNumber === currentPage + 1,
              })}
              onClick={() => {
                const offsetCalc =
                  Math.floor(((pageNumber - 1) * pageSize) / limit) * limit
                setOffset(offsetCalc)
                setCurrentPage?.(pageNumber - 1)
                setTimeout(() => {
                  table.setPageIndex(pageNumber - offsetCalc / pageSize - 1)
                }, 1)
              }}
            >
              {pageNumber}
            </PaginationItem>
          ) : null
        })}
      </PaginationContent>
    </PaginationWrapper>
  )
}

function usePagination({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}: {
  totalCount: number
  pageSize: number
  siblingCount: number
  currentPage: number
}) {
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize)

    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5

    /*
			Case 1:
			If the number of pages is less than the page numbers we want to show in our
			paginationComponent, we return the range [1..totalPageCount]
		*/
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount)
    }

    /*
			Calculate left and right sibling index and make sure they are within range 1 and totalPageCount
		*/
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount,
    )

    /*
			We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2
		*/
    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2

    const firstPageIndex = 1
    const lastPageIndex = totalPageCount

    /*
			Case 2: No left dots to show, but rights dots to be shown
		*/
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = range(1, leftItemCount)

      return [...leftRange, DOTS, totalPageCount]
    }

    /*
			Case 3: No right dots to show, but left dots to be shown
		*/
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount,
      )
      return [firstPageIndex, DOTS, ...rightRange]
    }

    /*
			Case 4: Both left and right dots to be shown
		*/
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
    }
  }, [totalCount, pageSize, siblingCount, currentPage])

  return paginationRange
}

function range(start: number, end: number) {
  const length = end - start + 1
  /*
		Create an array of certain length and set the elements within it from
		start value to end value.
	*/
  return Array.from({ length }, (_, idx) => idx + start)
}
