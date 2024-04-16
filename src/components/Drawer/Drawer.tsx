import { HiOutlineXMark } from 'react-icons/hi2'
import 'intersection-observer'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetContentArea,
  SheetData,
  SheetScroll,
  SheetClose,
  SheetFooter,
} from '../Sheet'
import { cn } from '~/utils/misc'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-4xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

export type DrawerProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  renderFooter: () => React.ReactNode
  size?: keyof typeof sizes
  resetData?: () => void
  modal?: boolean
  side?: 'left' | 'right' | 'top' | 'bottom'
  classNameBody?: string
  classNameHeader?: string
  classNameContentArea?: string
}

export const Drawer = ({
  title,
  children,
  isOpen,
  onClose,
  renderFooter,
  size = 'md',
  modal = false,
  side = 'right',
  classNameBody = '',
  classNameHeader = '',
  classNameContentArea = '',
}: DrawerProps) => {
  return (
    <Sheet open={isOpen} modal={modal}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        side={side}
      >
        <SheetContentArea className={classNameContentArea}>
          <div className={cn('w-screen', sizes[size])}>
            <SheetBody className={classNameBody}>
              <SheetScroll>
                <SheetHeader className={classNameHeader}>
                  <SheetTitle>{title}</SheetTitle>
                  <SheetClose>
                    <button
                      className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </SheetClose>
                </SheetHeader>
                <SheetData>{children}</SheetData>
              </SheetScroll>
              <SheetFooter>{renderFooter()}</SheetFooter>
            </SheetBody>
          </div>
        </SheetContentArea>
      </SheetContent>
    </Sheet>
  )
}
