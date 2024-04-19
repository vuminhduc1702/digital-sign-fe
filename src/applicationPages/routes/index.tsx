import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, type RouteObject } from 'react-router-dom'
import { PATHS } from '@/routes/PATHS'
import { lazyImport } from '@/utils/lazyImport'
import storage from '@/utils/storage'
import { AppSdk } from '../components/AppSdk/AppSdk'
import { AppDebug } from '../components/AppDebug/AppDebug'
import { endProgress, startProgress } from '@/components/Progress'
import { AnimatedWrapper } from '@/components/Animated'

const { ErrorFallback } = lazyImport(
  () => import('@/pages/ErrorPage'),
  'ErrorFallback',
)

const projectId = storage.getProject()?.id

export const ApplicationRoutes = [
  {
    path: PATHS.APPSDK,
    children: [
      {
        index: true,
        element: <Navigate to={`${PATHS.APPSDK}/${projectId}`} replace />,
      },
      {
        path: ':projectId',
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <AppSdk />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('../components/AppSdk/AppSdk')
          endProgress()

          return null
        },
      },
    ],
  },
  {
    path: PATHS.APPDEBUG,
    children: [
      {
        index: true,
        element: <Navigate to={`${PATHS.APPDEBUG}/${projectId}`} replace />,
      },
      {
        path: ':projectId',
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <AppDebug />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('../components/AppDebug/AppDebug')
          endProgress()

          return null
        },
      },
    ],
  },
] as const satisfies RouteObject[]
