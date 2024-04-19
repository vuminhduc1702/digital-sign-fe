import { ErrorBoundary } from 'react-error-boundary'

import { lazyImport } from '@/utils/lazyImport'
import { PATHS } from '@/routes/PATHS'
import { endProgress, startProgress } from '@/components/Progress'
import { type RouteObject } from 'react-router-dom'
import { AnimatedWrapper } from '@/components/Animated'

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
    loader: async () => {
      startProgress()
      await import('@/layout/BillingLayout')
      endProgress()

      return null
    },
    children: [
      {
        path: PATHS.BILLING,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                  <BillingTemplate />
                </AnimatedWrapper>
              </ErrorBoundary>
            ),
            loader: async () => {
              startProgress()
              await import('./BillingTemplate')
              endProgress()

              return null
            },
            children: [{ path: ':orgId' }],
          },
        ],
      },
    ],
  },
] as const satisfies RouteObject[]
