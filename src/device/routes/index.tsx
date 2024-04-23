import { ErrorBoundary } from 'react-error-boundary'
import { PATHS } from '@/routes/PATHS'
import { lazyImport } from '@/utils/lazyImport'
import { Devkit } from '../components/Devkit/Devkit'
import { Navigate, type RouteObject } from 'react-router-dom'
import storage from '@/utils/storage'
import { Module } from '../components/Module/Module'
import { endProgress, startProgress } from '@/components/Progress'

const { ErrorFallback } = lazyImport(
  () => import('@/pages/ErrorPage'),
  'ErrorFallback',
)
const projectId = storage.getProject()?.id

export const DeviceRoutes = [
  {
    path: PATHS.DEVKIT,
    children: [
      {
        index: true,
        element: <Navigate to={`${PATHS.DEVKIT}/${projectId}`} replace />,
      },
      {
        path: ':projectId',
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Devkit />
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('../components/Devkit/Devkit')
          endProgress()

          return null
        },
      },
    ],
  },
  {
    path: PATHS.MODULE,
    children: [
      {
        index: true,
        element: <Navigate to={`${PATHS.MODULE}/${projectId}`} replace />,
      },
      {
        path: ':projectId',
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Module />
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('../components/Module/Module')
          endProgress()

          return null
        },
      },
    ],
  },
] as const satisfies RouteObject[]
