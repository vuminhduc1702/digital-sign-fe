import { ErrorBoundary } from 'react-error-boundary'

import { lazyImport } from '@/utils/lazyImport'
import { PATHS } from '@/routes/PATHS'

const { ErrorFallback } = lazyImport(
  () => import('@/pages/ErrorPage'),
  'ErrorFallback',
)
const { BillingLayout } = lazyImport(
  () => import('@/layout/BillingLayout'),
  'BillingLayout',
)

const { BillingTemplate } = lazyImport(
  () => import('./BillingTemplate'),
  'BillingTemplate',
)

export const BillingRoutes = [
  {
    element: <BillingLayout />,
    children: [
      {
        path: PATHS.BILLING,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <BillingTemplate />
              </ErrorBoundary>
            ),
            children: [{ path: ':orgId' }],
          },
        ],
      },
    ],
  },
]
