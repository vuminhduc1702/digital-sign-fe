import { Outlet } from 'react-router-dom'
import { Suspense, useState } from 'react'
import { HiOutlineBars3 } from 'react-icons/hi2'

import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import { Spinner } from '~/components/Spinner'
import MobileSidebar from './components/MobileSidebar'
import logo from '~/assets/images/logo.svg'
import { cn } from '~/utils/misc'
import { NavLink } from '~/components/Link'

function MainLayout({ hasSideBar = true }: { hasSideBar?: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen overflow-hidden md:h-screen">
      {hasSideBar ? (
        <>
          <MobileSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <Sidebar />
        </>
      ) : null}
      <div className="flex w-full flex-col">
        <div className="flex">
          {hasSideBar ? (
            <button
              className="bg-secondary-900 px-4 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <HiOutlineBars3 className="h-6 w-6" aria-hidden="true" />
            </button>
          ) : null}

          {hasSideBar ? null : (
            <NavLink
              to="https://iot.vtscloud.vn/"
              reloadDocument
              className="flex h-20 min-w-[256px] items-center justify-center border-b-[2px] border-solid bg-white"
            >
              <img src={logo} alt="logo" className="h-14 cursor-pointer" />
            </NavLink>
          )}
          <Navbar />
        </div>

        <Suspense
          fallback={
            <div className="flex grow items-center justify-center">
              <Spinner size="xl" />
            </div>
          }
        >
          <main
            className={cn(
              'flex w-full grow flex-col self-center overflow-y-auto p-3',
            )}
          >
            <Outlet />
          </main>
        </Suspense>
      </div>
    </div>
  )
}

export default MainLayout
