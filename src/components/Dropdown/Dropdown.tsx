import { Menu, Transition } from '@headlessui/react'
import { Fragment, type ReactNode, forwardRef } from 'react'
import clsx from 'clsx'

type IconProps =
  | { icon: React.ReactElement; title?: never }
  | { title: string; icon?: never }

type MenuItemProps = {
  children: ReactNode
  className?: string
  icon?: React.ReactElement
  onClick: () => Promise<void> | void
}

type DropdownProps = {
  children: ReactNode
  menuClass?: string
} & IconProps

export function Dropdown({ title, icon, children, menuClass }: DropdownProps) {
  return (
    <Menu as="div" className={clsx('relative flex text-left', menuClass)}>
      <Menu.Button
        className={clsx(
          'flex w-full items-center justify-center rounded-md text-body-sm text-white hover:bg-opacity-30 hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75',
        )}
      >
        {title ?? icon}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-11 w-32 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">{children}</div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export function MenuItem({
  children,
  className,
  icon,
  ...props
}: MenuItemProps) {
  return (
    <Menu.Item>
      <button
        className={clsx(
          'group flex w-full items-center rounded-md px-2 py-2 text-body-sm hover:text-primary-300',
          { className },
        )}
        {...props}
      >
        <div className="flex gap-x-2">
          {icon}
          {children}
        </div>
      </button>
    </Menu.Item>
  )
}
