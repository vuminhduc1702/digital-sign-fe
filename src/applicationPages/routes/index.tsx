import { ErrorBoundary } from 'react-error-boundary'
import { Navigate } from 'react-router-dom'
import { PATHS } from '@/routes/PATHS'
import { lazyImport } from '@/utils/lazyImport'
import storage from '@/utils/storage'
import { AppSdk } from '../components/AppSdk/AppSdk'
import { AppDebug } from '../components/AppDebug/AppDebug'

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
            <AppSdk />
          </ErrorBoundary>
        ),
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
            <AppDebug />
          </ErrorBoundary>
        ),
      },
    ],
  },
]
