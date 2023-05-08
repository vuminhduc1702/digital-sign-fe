import { lazyImport } from '~/utils/lazyImport'
import { BASE_PATH } from './PATHS'

const { AuthRoutes } = lazyImport(() => import('~/features/auth'), 'AuthRoutes')

export const publicRoutes = [
  {
    path: `${BASE_PATH}*`,
    element: <AuthRoutes />,
  },
]
