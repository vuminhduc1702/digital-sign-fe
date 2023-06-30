import storage from '~/utils/storage'
import SideNavigation from './SideNavigation'

import logo from '~/assets/images/logo.svg'

function Sidebar() {
  return (
    <div className="hidden w-64 flex-col lg:flex lg:flex-shrink-0">
      <nav
        className="grow space-y-1 overflow-y-auto bg-secondary-400"
        aria-label="Sidebar"
      >
        <div className="flex h-20 items-center justify-center border-b-[2px] border-solid bg-white">
          <img src={logo} alt="logo" className="h-14" />
        </div>
        <SideNavigation />
      </nav>
    </div>
  )
}

export default Sidebar
