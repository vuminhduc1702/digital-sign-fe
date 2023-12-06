import { useLocation, useNavigate, useRoutes } from 'react-router-dom'

import { BASE_PATH, PATHS } from './PATHS'
import { useUser } from '~/lib/auth'
import { lazyImport } from '~/utils/lazyImport'

import { protectedRoutes } from './protected'
import { publicRoutes } from './public'
import { useEffect } from 'react'

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
const { VersionPage } = lazyImport(
  () => import('~/pages/VersionPage'),
  'VersionPage',
)

export const AppRoutes = () => {
  const navigate = useNavigate()
  const location = useLocation()

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
    {
      path: PATHS.VERSION,
      element: <VersionPage />,
    },
  ]

  useEffect(() => {
    if (
      user.data == null &&
      location.pathname !== PATHS.FORGETPASSWORD &&
      location.pathname !== PATHS.REGISTER &&
      location.pathname !== PATHS.LOGIN &&
      !commonRoutes.some(item => item.path === location.pathname)
    ) {
      navigate(PATHS.LOGIN, { state: { from: location }, replace: true })
    }
  }, [location.pathname, user.data])

  const routes = user.data ? protectedRoutes : publicRoutes

  const element = useRoutes([...routes, ...commonRoutes])

  return <>{element}</>
}
