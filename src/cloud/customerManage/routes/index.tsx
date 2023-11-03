import { ErrorBoundary } from 'react-error-boundary'

import { PATHS } from '~/routes/PATHS'
import { lazyImport } from '~/utils/lazyImport'
import { InfoCustomer } from '../components/Customer/InfoCustomer'

const { ErrorFallback } = lazyImport(
  () => import('~/pages/ErrorPage'),
  'ErrorFallback',
)
const { CustomerManageLayout } = lazyImport(
  () => import('~/layout/CustomerManageLayout'),
  'CustomerManageLayout',
)

const { CustomerManageTemplate } = lazyImport(
  () => import('./CustomerManageTemplate'),
  'CustomerManageTemplate',
)

export const CustomerManageRoutes = [
  {
    element: <CustomerManageLayout />,
    children: [
      {
        path: PATHS.CUSTOMER_MANAGE,
        children: [
          {
            path: ':projectId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <CustomerManageTemplate />
              </ErrorBoundary>
            )
          },
          {
            path: ':projectId/:customerId',
            element: (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <InfoCustomer />
              </ErrorBoundary>
            ),
          },
        ],
      },
    ],
  },
]
