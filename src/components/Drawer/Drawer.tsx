import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import 'intersection-observer'
import { type Dispatch, Fragment, type SetStateAction, useEffect } from 'react'

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
  otherState?: boolean | string
  setOtherState?: Dispatch<SetStateAction<any>>
}

export const Drawer = ({
  title,
  children,
  isOpen,
  onClose,
  renderFooter,
  size = 'md',
  otherState,
  setOtherState,
}: DrawerProps) => {
  useEffect(() => {
    if (typeof otherState === 'boolean') {
      setOtherState?.(false)
    }
  }, [isOpen])

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed inset-0 z-40 overflow-hidden"
        open={isOpen}
        onClose={() => null}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300 sm:duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300 sm:duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className={clsx('w-screen', sizes[size])}>
                <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-body-md font-medium text-gray-900">
                          {title}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex grow px-4 sm:px-6">
                      {children}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 justify-end space-x-2 p-4">
                    {renderFooter()}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
