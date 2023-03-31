import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Sidebar />
      <div className="ml-0 mt-[9vh] flex min-h-[91vh] flex-col px-4 py-3 lg:ml-[254px]">
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout
