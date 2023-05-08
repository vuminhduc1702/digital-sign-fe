import { PATHS } from './PATHS'
import { lazyImport } from '~/utils/lazyImport'

import MainLayout from '~/layout/MainLayout'

import { OrgManagementRoutes } from '~/cloud/orgManagement'
import { Login } from '~/features/auth/routes/Login'
import { Register } from '~/features/auth/routes/Register'

const { DeviceTemplate } = lazyImport(
  () => import('~/cloud/deviceTemplate'),
  'DeviceTemplate',
)
const { FlowEngine } = lazyImport(
  () => import('~/cloud/flowEngine'),
  'FlowEngine',
)
const { Dashboard } = lazyImport(() => import('~/cloud/dashboard'), 'Dashboard')
const { RoleManage } = lazyImport(() => import('~/cloud/role'), 'RoleManage')

const { MaintainPage } = lazyImport(
  () => import('~/pages/MaintainPage'),
  'MaintainPage',
)
const { NotFoundPage } = lazyImport(
  () => import('~/pages/NotFoundPage'),
  'NotFoundPage',
)

export function RouteList() {
  return [
    {
      element: <MainLayout />,
      children: [
        ...OrgManagementRoutes,
        {
          path: PATHS.DEVICE_TEMPLATE,
          element: <DeviceTemplate />,
          children: [{ path: ':projectId' }],
        },
        {
          path: PATHS.FLOW_ENGINE,
          element: <FlowEngine />,
          children: [{ path: ':projectId' }],
        },
        {
          path: PATHS.DASHBOARD,
          element: <Dashboard />,
          children: [{ path: ':projectId' }],
        },
        {
          path: PATHS.ROLE_MANAGE,
          element: <RoleManage />,
          children: [{ path: ':projectId' }],
        },
      ],
    },
    {
      path: PATHS.MAINTAIN,
      element: <MaintainPage />,
    },
    {
      path: PATHS.NOTFOUND,
      element: <NotFoundPage />,
    },
  ]
}
