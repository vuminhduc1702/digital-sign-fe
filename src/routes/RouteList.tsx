import { useMediaQuery, mediaQueryPoint } from '~/utils/hooks'
import { PATHS } from './PATHS'

import MainLayout from '~/layout/MainLayout'

import DeviceTemplate from '~/cloud/deviceTemplate'
import FlowEngine from '~/cloud/flowEngine'
import Dashboard from '~/cloud/dashboard'

import MaintainPage from '~/pages/MaintainPage'
import NotFoundPage from '~/pages/NotFoundPage'
import { OrgManagementRoutes } from '~/cloud/orgManagement'

export function RouteList() {
  const isMobileMD = useMediaQuery(`(max-width: ${mediaQueryPoint.md}px)`)

  // TODO: Router transition animation

  return [
    {
      element: <MainLayout />,
      children: [
        ...OrgManagementRoutes,
        {
          path: PATHS.DEVICE_TEMPLATE,
          element: <DeviceTemplate />,
        },
        {
          path: PATHS.FLOW_ENGINE,
          element: <FlowEngine />,
        },
        {
          path: PATHS.DASHBOARD,
          element: <Dashboard />,
        },
        {
          path: PATHS.MAINTAIN,
          element: <MaintainPage />,
        },
        {
          path: PATHS.NOTFOUND,
          element: <NotFoundPage />,
        },
      ],
    },
  ]
}
