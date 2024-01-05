import { XMarkIcon } from '@heroicons/react/24/outline'
import 'intersection-observer'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetPortal,
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
}

export const Drawer = ({
  title,
  children,
  isOpen,
  onClose,
  renderFooter,
  size = 'md',
}: DrawerProps) => {
  return (
    <Sheet open={isOpen} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
      >
        {/* <div className="fixed inset-0 z-40 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed inset-y-0 right-0 flex max-w-full">
              <div className={cn('w-screen', sizes[size])}> */}
        {/* <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"> */}
        {/* <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6"> */}
        {/* <div className="px-4 sm:px-6"> */}
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {/* <div className="ml-3 flex h-7 items-center">
          <SheetClose>
            <button
              className="text-secondary-900 hover:text-secondary-700 focus:ring-secondary-600 rounded-md bg-white focus:outline-none focus:ring-2"
              onClick={onClose}
            >
              <span className="sr-only">Close panel</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </SheetClose>
        </div> */}
        {/* </div> */}
        {/* </div> */}
        {/* <div className="relative mt-6 flex grow justify-center px-4 sm:px-6"> */}
        {children}
        {/* </div> */}
        {/* </div> */}
        <SheetFooter>{renderFooter()}</SheetFooter>
        {/* </div>
            </div>
          </div>
        </div> */}
      </SheetContent>
    </Sheet>
  )
}
