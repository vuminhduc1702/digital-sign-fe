import { lazyImport } from '~/utils/lazyImport'
import { PATHS } from '~/routes/PATHS'

const { OrgManagementLayout } = lazyImport(
  () => import('~/layout/OrgManagementLayout'),
  'OrgManagementLayout',
)
const { DeviceManageLayout } = lazyImport(
  () => import('../layout'),
  'DeviceManageLayout',
)

const { DeviceManage } = lazyImport(
  () => import('./DeviceManage'),
  'DeviceManage',
)
const { DeviceDetail } = lazyImport(
  () => import('./DeviceDetail'),
  'DeviceDetail',
)
const { OrgManage } = lazyImport(() => import('./OrgManage'), 'OrgManage')
const { GroupManage } = lazyImport(() => import('./GroupManage'), 'GroupManage')
const { UserManage } = lazyImport(() => import('./UserManage'), 'UserManage')
const { EventManage } = lazyImport(() => import('./EventManage'), 'EventManage')
const { RoleManage } = lazyImport(() => import('./RoleManage'), 'RoleManage')

export const OrgManagementRoutes = [
  {
    element: <OrgManagementLayout />,
    children: [
      {
        path: PATHS.ORG_MANAGEMENT,
        children: [
          {
            path: PATHS.ORG_MANAGE,
            element: <OrgManage />,
            children: [{ path: ':projectId/:orgId' }],
          },
          {
            path: PATHS.GROUP_MANAGE,
            element: <GroupManage />,
            children: [{ path: ':projectId/:orgId' }],
          },
          {
            path: PATHS.USER_MANAGE,
            element: <UserManage />,
            children: [{ path: ':projectId/:orgId' }],
          },
          {
            path: PATHS.DEVICE_MANAGE,
            element: <DeviceManageLayout />,
            children: [
              {
                path: ':projectId/:orgId',
                element: <DeviceManage />,
              },
              {
                path: ':projectId/:orgId/:deviceId',
                element: <DeviceDetail />,
              },
            ],
          },
          {
            path: PATHS.EVENT_MANAGE,
            element: <EventManage />,
            children: [{ path: ':projectId/:orgId' }],
          },
          {
            path: PATHS.ROLE_MANAGE,
            element: <RoleManage />,
            children: [{ path: ':projectId/:orgId' }],
          },
        ],
      },
    ],
  },
]
