import { ErrorBoundary } from 'react-error-boundary'
import { Navigate } from 'react-router-dom'

import { lazyImport } from '~/utils/lazyImport'
import { PATHS } from '~/routes/PATHS'
import DdosTemplate from './DdosTemplate'
import FuelTemplate from './FuelTemplate'

const { ErrorFallback } = lazyImport(
  () => import('~/pages/ErrorPage'),
  'ErrorFallback',
)
const { AiLayout } = lazyImport(() => import('~/layout/AiLayout'), 'AiLayout')

export const AiRoutes = [
  {
    element: <AiLayout />,
    path: PATHS.AI,
    children: [
      {
        index: true,
        element: <Navigate to={PATHS.DDOS} replace />,
      },
      {
        path: PATHS.DDOS,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DdosTemplate />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.FUEL,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <FuelTemplate />
          </ErrorBoundary>
        ),
      },
    ],
  },
]
