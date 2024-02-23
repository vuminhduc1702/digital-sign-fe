import { XMarkIcon } from '@heroicons/react/24/outline'
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
        <SheetContentArea>
          <div className={cn('w-screen', sizes[size])}>    
            <SheetBody>
              <SheetScroll>
                <SheetHeader>
                  <SheetTitle>
                    {title}
                  </SheetTitle>
                  <SheetClose>
                      <button
                        className="text-secondary-900 hover:text-secondary-700 focus:ring-secondary-600 rounded-md bg-white focus:outline-none focus:ring-2"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                  </SheetClose>
                </SheetHeader>  
                <SheetData>
                  {children}
                </SheetData>
              </SheetScroll>
              <SheetFooter>
                  {renderFooter()}
              </SheetFooter>
            </SheetBody>
          </div>
        </SheetContentArea>
      </SheetContent>
    </Sheet>
  )
}
