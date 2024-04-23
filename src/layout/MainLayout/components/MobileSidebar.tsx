import SideNavigation from './SideNavigation'

import logo from '@/assets/images/logo.svg'
import { Drawer } from '@/components/Drawer'
import { NavLink } from '@/components/Link'

type MobileSidebarProps = {
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function MobileSidebar({ sidebarOpen, setSidebarOpen }: MobileSidebarProps) {
  return (
    <Drawer
      isOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      title={''}
      renderFooter={() => <></>}
      modal={true}
      side="left"
      classNameBody="relative flex w-full max-w-xs flex-1 flex-col bg-secondary-400"
      classNameHeader="absolute right-2 top-1 z-10"
      classNameContentArea="justify-start"
    >
      <>
        <NavLink
          to="https://iot.vtscloud.vn/"
          reloadDocument
          className="flex h-20 items-center justify-center border-b-2 border-solid"
        >
          <img src={logo} alt="logo" className="h-14 cursor-pointer" />
        </NavLink>
        <nav className="space-y-1 px-2">
          <SideNavigation />
        </nav>
      </>
    </Drawer>
  )
}

export default MobileSidebar
