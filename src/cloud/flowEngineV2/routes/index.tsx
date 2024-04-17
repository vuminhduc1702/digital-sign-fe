import { ErrorBoundary } from 'react-error-boundary'
import { Navigate } from 'react-router-dom'

import { lazyImport } from '@/utils/lazyImport'
import { PATHS } from '@/routes/PATHS'
import storage from '@/utils/storage'

const { ErrorFallback } = lazyImport(
  () => import('@/pages/ErrorPage'),
  'ErrorFallback',
)
const { FlowEngineV2Layout } = lazyImport(
  () => import('@/layout/FlowEngineV2Layout'),
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

const { ShapeFlow } = lazyImport(() => import('./ShapeFlow'), 'ShapeFlow')

const { TemplateFlow } = lazyImport(
  () => import('./TemplateFlow'),
  'TemplateFlow',
)

const projectData = storage.getProject()

export const FlowEngineV2Routes = [
  {
    element: <FlowEngineV2Layout />,
    path: `${PATHS.FLOW_ENGINE_V2}`,
    children: [
      {
        index: true,
        element: (
          <Navigate
            to={`${
              projectData != null
                ? PATHS.THING_TEMPLATE + '/' + projectData?.id
                : PATHS.THING_TEMPLATE
            }`}
            replace
          />
        ),
      },
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
          },
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
    ],
  },
]
