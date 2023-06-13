import { useMemo } from 'react'
import clsx from 'clsx'

import { type Table } from '@tanstack/react-table'

const DOTS = '...'

const Pagination = <T extends Record<string, any>>({
  table,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className,
}: {
  table: Table<T>
  totalCount: number
  siblingCount?: number
  currentPage: number
  pageSize: number
  className?: string
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

  const onNext = () => {
    table.nextPage()
  }

  const onPrevious = () => {
    table.previousPage()
  }

  return (
    <ul
      className={clsx('flex cursor-pointer items-center gap-x-3', {
        className,
      })}
    >
      {/* Left navigation arrow */}
      <li
        className={clsx('pagination-item', {
          disabled: !table.getCanPreviousPage(),
        })}
        onClick={onPrevious}
      >
        <div className="arrow left" />
      </li>
      {paginationRange?.map((pageNumber, index) => {
        // If the pageItem is a DOT, render the DOTS unicode character
        if (pageNumber === DOTS) {
          return (
            <li className="pagination-item dots" key={index}>
              &#8230;
            </li>
          )
        }

        // Render our Page Pills
        return typeof pageNumber === 'number' ? (
          <li
            className={clsx('pagination-item', {
              selected: pageNumber === currentPage + 1,
            })}
            onClick={() => table.setPageIndex(pageNumber - 1)}
            key={index}
          >
            {pageNumber}
          </li>
        ) : null
      })}
      {/*  Right Navigation arrow */}
      <li
        className={clsx('pagination-item', {
          disabled: !table.getCanNextPage(),
        })}
        onClick={onNext}
      >
        <div className="arrow right" />
      </li>
    </ul>
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

export default Pagination
