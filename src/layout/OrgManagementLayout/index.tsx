import { Outlet } from 'react-router-dom'

import Navbar from './components/Navbar'
import Search from './components/Search'
import OrgMap from './components/OrgMap'

function OrgManagementLayout() {
  return (
    <>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex flex-col gap-2 md:col-span-1">
          <Search />
          <OrgMap />
        </div>
        <div className="flex flex-1 flex-col gap-2 md:col-span-2">
          <Navbar />
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default OrgManagementLayout
