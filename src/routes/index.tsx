import { useNavigate, useRoutes } from 'react-router-dom'

import { BASE_PATH, PATHS } from './PATHS'
import { useUser } from '~/lib/auth'
import { lazyImport } from '~/utils/lazyImport'

import { protectedRoutes } from './protected'
import { publicRoutes } from './public'
import { useEffect } from 'react'
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

export const AppRoutes = () => {
  const navigate = useNavigate()

  const user = useUser()

  useEffect(() => {
    const user = storage.getToken()
    if (!user) {
      navigate(PATHS.LOGIN)
    }
  }, [])

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
