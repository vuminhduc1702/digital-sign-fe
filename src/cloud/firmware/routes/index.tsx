import { ErrorBoundary } from 'react-error-boundary'

import { lazyImport } from '~/utils/lazyImport'
import { PATHS } from '~/routes/PATHS'

const { ErrorFallback } = lazyImport(
  () => import('~/pages/ErrorPage'),
  'ErrorFallback',
)
const { FirmWareLayout } = lazyImport(
  () => import('~/layout/FirmWareLayout'),
  'FirmWareLayout',
)

const { FirmwareTemplate } = lazyImport(
  () => import('./FirmwareTemplate'),
  'FirmwareTemplate',
)

export const FirmWareRoutes = [
  {
    element: <FirmWareLayout />,
    children: [
      {
        path: PATHS.FIRM_WARE,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <FirmwareTemplate />
              </ErrorBoundary>
            ),
            children: [{ path: ':orgId' }],
          },
        ],
      },
    ],
  },
]
