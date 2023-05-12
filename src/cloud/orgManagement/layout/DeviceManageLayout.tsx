import { Outlet, useParams } from 'react-router-dom'

export function ManageLayout() {
  const { projectId } = useParams()

  return (
    <div className="flex grow flex-col">
      {projectId ? (
        <div className="flex grow flex-col gap-y-3">
          <Outlet />
        </div>
      ) : null}
    </div>
  )
}
