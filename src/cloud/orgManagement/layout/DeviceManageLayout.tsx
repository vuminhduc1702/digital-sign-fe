import { Outlet, useParams } from 'react-router-dom'

export function DeviceManageLayout() {
  const { orgId } = useParams()

  return (
    <div className="flex grow flex-col">
      {orgId ? (
        <div className="flex grow flex-col gap-y-3">
          <Outlet />
        </div>
      ) : null}
    </div>
  )
}
