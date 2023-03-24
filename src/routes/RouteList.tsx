import { useMediaQuery, mediaQueryPoint } from '~/utils/hooks'
import { PATHS } from './PATHS'
import MainLayout from '~/layout/MainLayout'
import CloudPage from '~/pages/CloudPage'
import OrgMapPage from '~/pages/OrgMapPage'
import OrgManagementPage from '~/pages/OrgManagementPage'
import DeviceTemplatePage from '~/pages/DeviceTemplatePage'
import FlowEnginePage from '~/pages/FlowEnginePage'
import DashboardPage from '~/pages/DashboardPage'
import MaintainPage from '~/pages/MaintainPage'
import NotFoundPage from '~/pages/NotFoundPage'

export function RouteList() {
  const isMobileMD = useMediaQuery(`(max-width: ${mediaQueryPoint.md}px)`)

  // TODO: Router transition animation

  return [
    {
      element: <MainLayout />,
      children: [
        {
          index: true,
          path: PATHS.CLOUD_PAGE,
          element: <CloudPage />,
        },
        {
          path: PATHS.ORGMAP_PAGE,
          element: <OrgMapPage />,
        },
        {
          path: PATHS.ORGMANAGEMENT_PAGE,
          element: <OrgManagementPage />,
        },
        {
          path: PATHS.DEVICETEMPLATE_PAGE,
          element: <DeviceTemplatePage />,
        },
        {
          path: PATHS.FLOWENGINE_PAGE,
          element: <FlowEnginePage />,
        },
        {
          path: PATHS.DASHBOARD_PAGE,
          element: <DashboardPage />,
        },
        {
          path: PATHS.MAINTAIN_PAGE,
          element: <MaintainPage />,
        },
        {
          path: PATHS.NOTFOUND_PAGE,
          element: <NotFoundPage />,
        },
      ],
    },
  ]
}
