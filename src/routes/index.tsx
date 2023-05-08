import { useRoutes } from 'react-router-dom'

import { BASE_PATH, PATHS } from './PATHS'
import { useUser } from '~/lib/auth'
import { lazyImport } from '~/utils/lazyImport'

import { protectedRoutes } from './protected'
import { publicRoutes } from './public'

const { LandingPage } = lazyImport(
  () => import('~/pages/LandingPage'),
  'LandingPage',
)
const { MaintainPage } = lazyImport(
  () => import('~/pages/MaintainPage'),
  'MaintainPage',
)
const { NotFoundPage } = lazyImport(
  () => import('~/pages/NotFoundPage'),
  'NotFoundPage',
)

// TODO: Auto redirect to login if visit protected route

export const AppRoutes = () => {
  const user = useUser()

  const commonRoutes = [
    { path: BASE_PATH, element: <LandingPage /> },
    {
      path: PATHS.MAINTAIN,
      element: <MaintainPage />,
    },
    {
      path: PATHS.NOTFOUND,
      element: <NotFoundPage />,
    },
  ]

  const routes = user.data ? protectedRoutes : publicRoutes

  const element = useRoutes([...routes, ...commonRoutes])

  return <>{element}</>
}
