import { ErrorBoundary } from 'react-error-boundary'
import { DashboardLayout } from '@/layout/DashboardLayout'
import { ErrorFallback } from '@/pages/ErrorPage'

import { PATHS } from '@/routes/PATHS'
import { lazyImport } from '@/utils/lazyImport'
import { endProgress, startProgress } from '@/components/Progress'
import { type RouteObject } from 'react-router-dom'
import { AnimatedWrapper } from '@/components/Animated'

const { DashboardManage } = lazyImport(
  () => import('./DashboardManage'),
  'DashboardManage',
)
const { DashboardDetail } = lazyImport(
  () => import('./DashboardDetail'),
  'DashboardDetail',
)

export const DashboardManagementRoutes = [
  {
    element: <DashboardLayout />,
    loader: async () => {
      startProgress()
      await import('@/layout/DashboardLayout')
      endProgress()

      return null
    },
    children: [
      {
        path: PATHS.DASHBOARD,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                  <DashboardManage />
                </AnimatedWrapper>
              </ErrorBoundary>
            ),
            loader: async () => {
              startProgress()
              await import('./DashboardManage')
              endProgress()

              return null
            },
          },
          {
            path: ':projectId/:dashboardId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                  <DashboardDetail />
                </AnimatedWrapper>
              </ErrorBoundary>
            ),
            loader: async () => {
              startProgress()
              await import('./DashboardDetail')
              endProgress()

              return null
            },
          },
        ],
      },
    ],
  },
] as const satisfies RouteObject[]
