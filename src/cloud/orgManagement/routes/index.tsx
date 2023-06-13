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
const { ManageLayout } = lazyImport(() => import('../layout'), 'ManageLayout')

const { DeviceManage } = lazyImport(
  () => import('./DeviceManage'),
  'DeviceManage',
)
const { DeviceDetail } = lazyImport(
  () => import('./DeviceDetail'),
  'DeviceDetail',
)
const { GroupDetail } = lazyImport(() => import('./GroupDetail'), 'GroupDetail')
const { OrgManage } = lazyImport(() => import('./OrgManage'), 'OrgManage')
const { GroupManage } = lazyImport(() => import('./GroupManage'), 'GroupManage')
const { UserManage } = lazyImport(() => import('./UserManage'), 'UserManage')
const { EventManage } = lazyImport(() => import('./EventManage'), 'EventManage')

const idURL = window.location.pathname.split('/')[6]

export const OrgManagementRoutes = [
  {
    element: <OrgManagementLayout />,
    children: [
      {
        path: PATHS.ORG_MANAGE,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <OrgManage />
              </ErrorBoundary>
            ),
            children: [{ path: ':orgId' }],
          },
        ],
      },
      {
        path: PATHS.GROUP_MANAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <ManageLayout />
          </ErrorBoundary>
        ),
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <GroupManage />
              </ErrorBoundary>
            ),
            children: [{ path: ':orgId' }],
          },
          {
            path: idURL != null ? ':projectId/:orgId' : ':projectId',
            children: [
              {
                path: ':groupId',
                element: (
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <GroupDetail />
                  </ErrorBoundary>
                ),
              },
            ],
          },
        ],
      },
      {
        path: PATHS.USER_MANAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <UserManage />
          </ErrorBoundary>
        ),
        children: [{ path: ':projectId', children: [{ path: ':orgId' }] }],
      },
      {
        path: PATHS.DEVICE_MANAGE,
        element: <ManageLayout />,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <DeviceManage />
              </ErrorBoundary>
            ),
            children: [{ path: ':orgId' }],
          },
          {
            path: idURL != null ? ':projectId/:orgId' : ':projectId',
            children: [
              {
                path: ':deviceId',
                element: (
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <DeviceDetail />
                  </ErrorBoundary>
                ),
              },
            ],
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
        children: [{ path: ':projectId', children: [{ path: ':orgId' }] }],
      },
    ],
  },
]
