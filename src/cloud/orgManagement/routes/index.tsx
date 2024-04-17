import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, type RouteObject } from 'react-router-dom'

import { lazyImport } from '@/utils/lazyImport'
import { PATHS } from '@/routes/PATHS'
import storage from '@/utils/storage'
import { endProgress, startProgress } from '@/components/Progress'
import { AnimatedWrapper } from '@/components/Animated'

const { ErrorFallback } = lazyImport(
  () => import('@/pages/ErrorPage'),
  'ErrorFallback',
)
const { OrgManagementLayout } = lazyImport(
  () => import('@/layout/OrgManagementLayout'),
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

const projectData = storage.getProject()

export const OrgManagementRoutes = [
  {
    element: <OrgManagementLayout />,
    path: PATHS.ORG,
    loader: async () => {
      startProgress()
      await import('@/layout/OrgManagementLayout')
      endProgress()

      return null
    },
    children: [
      {
        path: PATHS.ORG_MANAGE,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                  <OrgManage />
                </AnimatedWrapper>
              </ErrorBoundary>
            ),
            loader: async () => {
              startProgress()
              await import('./OrgManage')
              endProgress()

              return null
            },
            children: [{ path: ':orgId' }],
          },
        ],
      },
      {
        path: PATHS.GROUP_MANAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <ManageLayout />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('../layout')
          endProgress()

          return null
        },
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                  <GroupManage />
                </AnimatedWrapper>
              </ErrorBoundary>
            ),
            loader: async () => {
              startProgress()
              await import('./GroupManage')
              endProgress()

              return null
            },
            children: [{ path: ':orgId' }],
          },
          {
            path: ':projectId/:orgId',
            children: [
              {
                path: ':groupId',
                element: (
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <AnimatedWrapper>
                      <GroupDetail />
                    </AnimatedWrapper>
                  </ErrorBoundary>
                ),
                loader: async () => {
                  startProgress()
                  await import('./GroupDetail')
                  endProgress()

                  return null
                },
              },
            ],
          },
        ],
      },
      {
        path: PATHS.USER_MANAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <UserManage />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('./UserManage')
          endProgress()

          return null
        },
        children: [{ path: ':projectId', children: [{ path: ':orgId' }] }],
      },
      {
        path: PATHS.DEVICE_MANAGE,
        element: <ManageLayout />,
        loader: async () => {
          startProgress()
          await import('../layout')
          endProgress()

          return null
        },
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                  <DeviceManage />
                </AnimatedWrapper>
              </ErrorBoundary>
            ),
            loader: async () => {
              startProgress()
              await import('./DeviceManage')
              endProgress()

              return null
            },
            children: [{ path: ':orgId' }],
          },
          {
            path: ':projectId/:orgId',
            children: [
              {
                path: ':deviceId',
                element: (
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <AnimatedWrapper>
                      <DeviceDetail />
                    </AnimatedWrapper>
                  </ErrorBoundary>
                ),
                loader: async () => {
                  startProgress()
                  await import('./DeviceDetail')
                  endProgress()

                  return null
                },
              },
            ],
          },
        ],
      },
      {
        path: PATHS.EVENT_MANAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <EventManage />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('./EventManage')
          endProgress()

          return null
        },
        children: [{ path: ':projectId', children: [{ path: ':orgId' }] }],
      },
    ],
  },
] as const satisfies RouteObject[]
