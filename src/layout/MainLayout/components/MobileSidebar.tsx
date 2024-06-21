import SideNavigation from './SideNavigation'

import logo from '@/assets/images/logo.svg'
import { NavLink } from '@/components/Link'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type MobileSidebarProps = {
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function MobileSidebar({ sidebarOpen, setSidebarOpen }: MobileSidebarProps) {
  return (
    <Sheet
      open={sidebarOpen}
      onOpenChange={() => setSidebarOpen(false)}
      modal={true}
      key="left"
    >
      <SheetContent
        className="max-w-xs bg-secondary-400"
        side="left"
        closeButtonAvai={true}
      >
        <SheetHeader className="absolute right-2 top-1 z-10"></SheetHeader>
        <div className="h-full overflow-y-auto">
          <NavLink
            to="https://iot.vtscloud.vn/"
            reloadDocument
            className="flex h-16 items-center justify-center border-b-2 border-solid"
          >
            <img src={logo} alt="logo" className="h-14 cursor-pointer" />
          </NavLink>
          <nav className="space-y-1 px-2">
            <SideNavigation />
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar
