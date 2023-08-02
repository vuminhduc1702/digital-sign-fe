import { Outlet } from 'react-router-dom'
import { Suspense, useState } from 'react'
import { Bars3Icon } from '@heroicons/react/20/solid'

import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import { Spinner } from '~/components/Spinner'
import MobileSidebar from './components/MobileSidebar'
import storage from '~/utils/storage'
import { useProjectIdStore } from '~/stores/project'

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const projectIdFromStore = useProjectIdStore(state => state.projectId)
  const projectId = storage.getProject()?.id || projectIdFromStore

  return (
    <div className="flex min-h-screen overflow-hidden md:h-screen">
      {projectId ? (
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
          {projectId ? (
            <button
              className="bg-secondary-900 px-4 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          ) : null}
          <Navbar />
        </div>
        <Suspense
          fallback={
            <div className="flex grow items-center justify-center">
              <Spinner size="xl" />
            </div>
          }
        >
          <main className="flex grow flex-col overflow-y-auto px-3 py-3">
            <Outlet />
          </main>
        </Suspense>
      </div>
    </div>
  )
}

export default MainLayout
