import { useNavigate } from 'react-router-dom'

import SideNavigation from './SideNavigation'
import { PATHS } from '~/routes/PATHS'

import logo from '~/assets/images/logo.svg'

function Sidebar() {
  const navigate = useNavigate()

  return (
    <div className="hidden w-64 flex-col lg:flex lg:flex-shrink-0">
      <nav
        className="grow space-y-1 overflow-y-auto bg-secondary-400"
        aria-label="Sidebar"
      >
        <div className="flex h-20 items-center justify-center border-b-[2px] border-solid bg-white">
          <img
            src={logo}
            alt="logo"
            className="h-14 cursor-pointer"
            onClick={() => navigate(PATHS.HOME)}
          />
        </div>
        <SideNavigation />
      </nav>
    </div>
  )
}

export default Sidebar
