import { ErrorBoundary } from 'react-error-boundary'

import { lazyImport } from '~/utils/lazyImport'
import { PATHS } from '~/routes/PATHS'

const { ErrorFallback } = lazyImport(
  () => import('~/pages/ErrorPage'),
  'ErrorFallback',
)
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

export const OrgManagementRoutes = [
  {
    element: <OrgManagementLayout />,
    children: [
      {
        path: PATHS.ORG_MANAGEMENT,
        children: [
          {
            path: PATHS.ORG_MANAGE,
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <OrgManage />
              </ErrorBoundary>
            ),
            children: [{ path: ':projectId', children: [{ path: ':orgId' }] }],
          },
          {
            path: PATHS.GROUP_MANAGE,
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <GroupManage />
              </ErrorBoundary>
            ),
            children: [{ path: ':projectId/:orgId' }],
          },
          {
            path: PATHS.USER_MANAGE,
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <UserManage />
              </ErrorBoundary>
            ),
            children: [{ path: ':projectId/:orgId' }],
          },
          {
            path: PATHS.DEVICE_MANAGE,
            element: <DeviceManageLayout />,
            children: [
              {
                path: ':projectId/:orgId',
                element: (
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <DeviceManage />,
                  </ErrorBoundary>
                ),
              },
              {
                path: ':projectId/:orgId/:deviceId',
                element: (
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <DeviceDetail />,
                  </ErrorBoundary>
                ),
              },
            ],
          },
          {
            path: PATHS.EVENT_MANAGE,
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <EventManage />
              </ErrorBoundary>
            ),
            children: [{ path: ':projectId/:orgId' }],
          },
        ],
      },
    ],
  },
]
