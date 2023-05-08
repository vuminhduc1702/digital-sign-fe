import { PATHS } from './PATHS'
import { lazyImport } from '~/utils/lazyImport'

import MainLayout from '~/layout/MainLayout'

import { OrgManagementRoutes } from '~/cloud/orgManagement'

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

export const protectedRoutes = [
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
]
