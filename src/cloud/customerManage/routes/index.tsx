import { ErrorBoundary } from 'react-error-boundary'

import { PATHS } from '@/routes/PATHS'
import { lazyImport } from '@/utils/lazyImport'
import { InfoCustomer } from '../components/Customer/InfoCustomer'
import { endProgress, startProgress } from '@/components/Progress'
import { type RouteObject } from 'react-router-dom'
import { AnimatedWrapper } from '@/components/Animated'

const { ErrorFallback } = lazyImport(
  () => import('@/pages/ErrorPage'),
  'ErrorFallback',
)
const { CustomerManageLayout } = lazyImport(
  () => import('@/layout/CustomerManageLayout'),
  'CustomerManageLayout',
)

const { CustomerManageTemplate } = lazyImport(
  () => import('./CustomerManageTemplate'),
  'CustomerManageTemplate',
)

export const CustomerManageRoutes = [
  {
    element: <CustomerManageLayout />,
    loader: async () => {
      startProgress()
      await import('@/layout/CustomerManageLayout')
      endProgress()

      return null
    },
    children: [
      {
        path: PATHS.CUSTOMER_MANAGE,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                  <CustomerManageTemplate />
                </AnimatedWrapper>
              </ErrorBoundary>
            ),
            loader: async () => {
              startProgress()
              await import('./CustomerManageTemplate')
              endProgress()

              return null
            },
          },
          {
            path: ':projectId/:customerId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                  <InfoCustomer />
                </AnimatedWrapper>
              </ErrorBoundary>
            ),
            loader: async () => {
              startProgress()
              await import('../components/Customer/InfoCustomer')
              endProgress()

              return null
            },
          },
        ],
      },
    ],
  },
] as const satisfies RouteObject[]
