import SideNavigation from './SideNavigation'
import { NavLink } from '@/components/Link'

import logo from '@/assets/images/hust.png'
import { PATHS } from '@/routes/PATHS'

function Sidebar() {
  return (
    <div className="hidden w-64 flex-col lg:flex lg:flex-shrink-0">
      <nav
        className="grow space-y-1 overflow-y-auto bg-white"
        aria-label="Sidebar"
      >
        <NavLink
          to={PATHS.SIGN}
          className="flex h-16 items-center justify-center border-b-2 border-solid bg-white"
        >
          <img src={logo} alt="logo" className="h-6 cursor-pointer" />
        </NavLink>
        <SideNavigation />
      </nav>
    </div>
  )
}

export default Sidebar
