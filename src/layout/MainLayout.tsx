import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Sidebar />
      <div className=" ml-0 mt-[9vh] min-h-[91vh] px-4 py-3 md:ml-[254px]">
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout
