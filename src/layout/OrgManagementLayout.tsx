import { Outlet } from 'react-router-dom'

function OrgManagementLayout() {
  return (
    <>
      <div className="grid min-h-[88vh] grid-cols-1 md:grid-cols-3">
        <div className="bg-gray-200 p-4 md:col-span-1">
          <div>Danh sách tổ chức</div>
          <div>Cây</div>
        </div>
        <div className="flex-1 bg-gray-400 p-4 md:col-span-2">
          <div>tab</div>
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default OrgManagementLayout
