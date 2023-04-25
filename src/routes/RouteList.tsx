import { PATHS } from './PATHS'

import MainLayout from '~/layout/MainLayout'

import { OrgManagementRoutes } from '~/cloud/orgManagement'

import DeviceTemplate from '~/cloud/deviceTemplate'
import FlowEngine from '~/cloud/flowEngine'
import Dashboard from '~/cloud/dashboard'

import MaintainPage from '~/pages/MaintainPage'
import NotFoundPage from '~/pages/NotFoundPage'
import LandingPage from '~/pages/LandingPage'

export function RouteList() {
  return [
    {
      element: <MainLayout />,
      children: [
        ...OrgManagementRoutes,
        {
          path: PATHS.HOME,
          element: <LandingPage />,
        },
        {
          path: PATHS.DEVICE_TEMPLATE_CHILD,
          element: <DeviceTemplate />,
        },
        {
          path: PATHS.FLOW_ENGINE_CHILD,
          element: <FlowEngine />,
        },
        {
          path: PATHS.DASHBOARD_CHILD,
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
