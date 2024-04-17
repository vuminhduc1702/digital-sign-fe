import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '@/pages/ErrorPage'

import { PATHS } from '@/routes/PATHS'
import { lazyImport } from '@/utils/lazyImport'

const { ProjectManage } = lazyImport(
  () => import('./ProjectManage'),
  'ProjectManage',
)

export const ProjectManagementRoutes = [
  {
    path: PATHS.PROJECT_MANAGE,
    element: (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ProjectManage />
      </ErrorBoundary>
    ),
  },
]
