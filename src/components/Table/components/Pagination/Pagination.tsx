import { forwardRef, useMemo } from 'react'
import { type Table } from '@tanstack/react-table'

import { cn } from '~/utils/misc'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'

const DOTS = '...'

const Pagination = <T extends Record<string, any>>({
  table,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  setCurrentPage,
}: {
  table: Table<T>
  totalCount: number
  siblingCount?: number
  currentPage: number
  pageSize: number
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>
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
              className={cn('', {
                'text-primary-400': pageNumber === currentPage + 1,
              })}
              onClick={() => {
                setCurrentPage?.(pageNumber - 1)
                table.setPageIndex(pageNumber - 1)
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
      let leftItemCount = 3 + 2 * siblingCount
      let leftRange = range(1, leftItemCount)

      return [...leftRange, DOTS, totalPageCount]
    }

    /*
			Case 3: No right dots to show, but left dots to be shown
		*/
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount
      let rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount,
      )
      return [firstPageIndex, DOTS, ...rightRange]
    }

    /*
			Case 4: Both left and right dots to be shown
		*/
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
    }
  }, [totalCount, pageSize, siblingCount, currentPage])

  return paginationRange
}

function range(start: number, end: number) {
  let length = end - start + 1
  /*
		Create an array of certain length and set the elements within it from
		start value to end value.
	*/
  return Array.from({ length }, (_, idx) => idx + start)
}

const PaginationWrapper = ({
  className,
  ...props
}: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex items-center gap-x-3', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('cursor-pointer', className)} {...props} />
  ),
)
PaginationItem.displayName = 'PaginationItem'

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <DotsHorizontalIcon className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export default Pagination
