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
const { FirmWareLayout } = lazyImport(
  () => import('@/layout/FirmWareLayout'),
  'FirmWareLayout',
)

const { FirmwareTemplate } = lazyImport(
  () => import('./FirmwareTemplate'),
  'FirmwareTemplate',
)

export const FirmWareRoutes = [
  {
    element: <FirmWareLayout />,
    children: [
      {
        path: PATHS.FIRM_WARE,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                  <FirmwareTemplate />
                </AnimatedWrapper>
              </ErrorBoundary>
            ),
            loader: async () => {
              startProgress()
              await import('./FirmwareTemplate')
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
