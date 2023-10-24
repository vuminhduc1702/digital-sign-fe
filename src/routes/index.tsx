import { useNavigate, useRoutes } from 'react-router-dom'

import { BASE_PATH, PATHS } from './PATHS'
import { useUser } from '~/lib/auth'
import { lazyImport } from '~/utils/lazyImport'

import { protectedRoutes } from './protected'
import { publicRoutes } from './public'
import { useEffect } from 'react'
import { useUserInfo } from '~/cloud/orgManagement/api/userAPI'
import storage from '~/utils/storage'

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

  const user = useUser()
  // const user = useUserInfo()

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
    const user = storage.getToken()
    if (
      !user &&
      window.location.pathname !== PATHS.FORGETPASSWORD &&
      window.location.pathname !== PATHS.REGISTER &&
      !commonRoutes.some(item => item.path === window.location.pathname)
    ) {
      navigate(PATHS.LOGIN)
    }
  }, [window.location.pathname])

  const routes = user.data ? protectedRoutes : publicRoutes

  const element = useRoutes([...routes, ...commonRoutes])

  return <>{element}</>
}
