import { ErrorBoundary } from 'react-error-boundary'

import { lazyImport } from '~/utils/lazyImport'
import { PATHS } from '~/routes/PATHS'

const { ErrorFallback } = lazyImport(
  () => import('~/pages/ErrorPage'),
  'ErrorFallback',
)
const { SubcriptionLayout } = lazyImport(
  () => import('~/layout/SubcriptionLayout'),
  'SubcriptionLayout',
)

const { SubcriptionTemplate } = lazyImport(
  () => import('./SubcriptionTemplate'),
  'SubcriptionTemplate',
)

export const SubcriptionRoutes = [
  {
    element: <SubcriptionLayout />,
    children: [
      {
        path: PATHS.BILLING_SUBSCRIPTION,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <SubcriptionTemplate />
              </ErrorBoundary>
            ),
            children: [{ path: ':orgId' }],
          },
        ],
      },
    ],
  },
]
