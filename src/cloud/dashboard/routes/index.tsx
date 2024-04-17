import { ErrorBoundary } from 'react-error-boundary'
import { DashboardLayout } from '@/layout/DashboardLayout'
import { ErrorFallback } from '@/pages/ErrorPage'

import { PATHS } from '@/routes/PATHS'
import { lazyImport } from '@/utils/lazyImport'

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
    children: [
      {
        path: PATHS.DASHBOARD,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <DashboardManage />
              </ErrorBoundary>
            ),
          },
          {
            path: ':projectId/:dashboardId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <DashboardDetail />
              </ErrorBoundary>
            ),
          },
        ],
      },
    ],
  },
]
