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

const { ShapeFlow } = lazyImport(
  () => import('./ShapeFlow'),
  'ShapeFlow',
)

const { TemplateFlow } = lazyImport(
  () => import('./TemplateFlow'),
  'TemplateFlow',
)

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
        path: PATHS.TEMPLATE_FLOW,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <TemplateFlow />
              </ErrorBoundary>
            ),
            children: [{ path: ':orgId' }],
          },
        ],
      },
      {
        path: PATHS.SHAPE_FLOW,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <ShapeFlow />
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
