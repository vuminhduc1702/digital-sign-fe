import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Fragment } from 'react'

import LPnavigation from './LPnavigation'

type MobileSidebarProps = {
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  childToParent: (childdata: string) => void
}

function MobileLP({
  sidebarOpen,
  setSidebarOpen,
  childToParent,
}: MobileSidebarProps) {
  return (
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed inset-0 z-40 flex xl:hidden"
        open={sidebarOpen}
        onClose={setSidebarOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-secondary-900 bg-opacity-75" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="relative flex w-full max-w-[420px] flex-1 flex-col bg-red-600 xs2:max-w-[320px]">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute right-0 top-0 -mr-12 pt-2 xs2:right-20 xs2:top-8 xs:right-20 xs:top-8">
                <button
                  className="ml-1 flex size-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="size-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </Transition.Child>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-1 px-2">
                <LPnavigation childToParent={childToParent} />
              </nav>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  )
}

export default MobileLP
