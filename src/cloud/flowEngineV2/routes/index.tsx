import { ErrorBoundary } from 'react-error-boundary'

import { lazyImport } from '~/utils/lazyImport'
import { PATHS } from '~/routes/PATHS'

const { ErrorFallback } = lazyImport(
  () => import('~/pages/ErrorPage'),
  'ErrorFallback',
)
const { FlowEngineV2Layout } = lazyImport(
  () => import('~/layout/FlowEngineV2Layout'),
  'FlowEngineV2Layout',
)

const { ThingTemplate } = lazyImport(
  () => import('./ThingTemplate'),
  'ThingTemplate',
)
const { ThingServices } = lazyImport(
  () => import('./ThingService'),
  'ThingServices',
)

const idURL = window.location.pathname.split('/')[5]

export const FlowEngineV2Routes = [
  {
    element: <FlowEngineV2Layout />,
    children: [
      {
        path: PATHS.THING_TEMPLATE,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <ThingTemplate />
              </ErrorBoundary>
            ),
            children: [{ path: ':orgId' }],
          },
        ],
      },
      {
        path: PATHS.THING_SERVICE,
        children: [
          {
            path: ':projectId/:thingId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <ThingServices />
              </ErrorBoundary>
            ),
          },
        ],
      },
    ],
  },
]
