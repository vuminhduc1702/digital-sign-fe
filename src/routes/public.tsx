import { lazyImport } from '~/utils/lazyImport'
import { BASE_PATH } from './PATHS'
import storage from '~/utils/storage'

const { AuthRoutes } = lazyImport(() => import('~/features/auth'), 'AuthRoutes')

const userDataFromStorage = storage.getToken()

export const publicRoutes = [
  {
    path: `${BASE_PATH}*`,
    element: userDataFromStorage == null ? <AuthRoutes /> : null,
  },
]
