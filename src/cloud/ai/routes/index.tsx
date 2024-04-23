import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, type RouteObject } from 'react-router-dom'

import { lazyImport } from '@/utils/lazyImport'
import { PATHS } from '@/routes/PATHS'
import DdosTemplate from './DdosTemplate'
import FuelTemplate from './FuelTemplate'
import { endProgress, startProgress } from '@/components/Progress'
import { AnimatedWrapper } from '@/components/Animated'

const { ErrorFallback } = lazyImport(
  () => import('@/pages/ErrorPage'),
  'ErrorFallback',
)
const { AiLayout } = lazyImport(() => import('@/layout/AiLayout'), 'AiLayout')

export const AiRoutes = [
  {
    element: <AiLayout />,
    path: PATHS.AI,
    loader: async () => {
      startProgress()
      await import('@/layout/AiLayout')
      endProgress()

      return null
    },
    children: [
      {
        index: true,
        element: <Navigate to={PATHS.DDOS} replace />,
      },
      {
        path: PATHS.DDOS,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <DdosTemplate />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('./DdosTemplate')
          endProgress()

          return null
        },
      },
      {
        path: PATHS.FUEL,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <FuelTemplate />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('./FuelTemplate')
          endProgress()

          return null
        },
      },
    ],
  },
] as const satisfies RouteObject[]
