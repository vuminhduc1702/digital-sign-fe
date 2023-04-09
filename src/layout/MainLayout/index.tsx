import { Outlet } from 'react-router-dom'
import { Suspense, useState } from 'react'
import { Bars3Icon } from '@heroicons/react/20/solid'

import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import { Spinner } from '~/components/Spinner'
import MobileSidebar from './components/MobileSidebar'

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  console.log('sidebarOpen', sidebarOpen)

  return (
    <div className="flex min-h-screen overflow-hidden">
      <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <Sidebar />
      <div className="flex grow flex-col">
        <div className="flex">
          <button
            className="bg-secondary-900 px-4 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <Navbar />
        </div>
        <Suspense
          fallback={
            <div className="flex grow items-center justify-center">
              <Spinner size="xl" />
            </div>
          }
        >
          <main className="flex grow flex-col px-3 py-3">
            <Outlet />
          </main>
        </Suspense>
      </div>
    </div>
  )
}

export default MainLayout
