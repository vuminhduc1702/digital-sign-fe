import SideNavigation from './SideNavigation'

import logo from '@/assets/images/hust.png'
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
import { PATHS } from '@/routes/PATHS'

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
        className="max-w-xs bg-white p-0"
        side="left"
        closeButtonAvai={true}
      >
        <SheetHeader className="absolute right-2 top-1 z-10"></SheetHeader>
        <div className="h-full overflow-y-auto">
          <NavLink
            to={PATHS.SIGN}
            className="flex h-16 items-center justify-center border-b-2 border-solid"
          >
            <img src={logo} alt="logo" className="h-6 cursor-pointer" />
          </NavLink>
          <nav className="space-y-1 bg-white">
            <SideNavigation />
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar
