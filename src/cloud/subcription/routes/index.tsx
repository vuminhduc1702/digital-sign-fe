import { ErrorBoundary } from 'react-error-boundary'

import { lazyImport } from '@/utils/lazyImport'
import { PATHS } from '@/routes/PATHS'
import { endProgress, startProgress } from '@/components/Progress'
import { type RouteObject } from 'react-router-dom'

const { ErrorFallback } = lazyImport(
  () => import('@/pages/ErrorPage'),
  'ErrorFallback',
)
const { SubcriptionLayout } = lazyImport(
  () => import('@/layout/SubcriptionLayout'),
  'SubcriptionLayout',
)

const { SubcriptionTemplate } = lazyImport(
  () => import('./SubcriptionTemplate'),
  'SubcriptionTemplate',
)

export const SubscriptionRoutes = [
  {
    element: <SubcriptionLayout />,
    loader: async () => {
      startProgress()
      await import('@/layout/SubcriptionLayout')
      endProgress()

      return null
    },
    children: [
      {
        path: PATHS.BILLING_SUBSCRIPTION,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <SubcriptionTemplate />
              </ErrorBoundary>
            ),
            loader: async () => {
              startProgress()
              await import('./SubcriptionTemplate')
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
