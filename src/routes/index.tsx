import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  type RouteObject,
  RouterProvider,
} from 'react-router-dom'
import { useEffect } from 'react'

import { PATHS } from './PATHS'
import { useUser } from '@/lib/auth'
import { lazyImport } from '@/utils/lazyImport'
import { protectedRoutes } from './protected'
import { publicRoutes } from './public'
import { endProgress, startProgress } from '@/components/Progress'

const { MaintainPage } = lazyImport(
  () => import('@/pages/MaintainPage'),
  'MaintainPage',
)
const { NotFoundPage } = lazyImport(
  () => import('@/pages/NotFoundPage'),
  'NotFoundPage',
)

export const AppRoutes = () => {
  const { data: userDataFromStorage } = useUser()

  const commonRoutes = [
    {
      path: PATHS.MAINTAIN,
      element: <MaintainPage />,
      loader: async () => {
        startProgress()
        await import('@/pages/MaintainPage')
        endProgress()

        return null
      },
    },
    {
      path: PATHS.NOTFOUND,
      element: <NotFoundPage />,
      loader: async () => {
        startProgress()
        await import('@/pages/NotFoundPage')
        endProgress()

        return null
      },
    },
  ] as const satisfies RouteObject[]

  const isNotAuthRoutes =
    window.location.pathname !== PATHS.FORGETPASSWORD &&
    window.location.pathname !== PATHS.REGISTER &&
    window.location.pathname !== PATHS.LOGIN
  const isAuthRoutes =
    window.location.pathname === PATHS.FORGETPASSWORD ||
    window.location.pathname === PATHS.REGISTER ||
    window.location.pathname === PATHS.LOGIN

  // Auto redirect to login page when token is null
  useEffect(() => {
    if (
      userDataFromStorage == null &&
      isNotAuthRoutes &&
      !commonRoutes.some(item => item.path === window.location.pathname)
    ) {
      window.location.href = PATHS.LOGIN
    }
  }, [commonRoutes, isNotAuthRoutes, userDataFromStorage])

  // Auto redirect to project manage page when token is available or when projectId is null
  useEffect(() => {
    if (userDataFromStorage != null && isAuthRoutes) {
      window.location.href = PATHS.SIGN
    }
  }, [isAuthRoutes, userDataFromStorage])

  const routes = userDataFromStorage ? protectedRoutes : publicRoutes

  const mapRoutes = (routes: Readonly<RouteObject[]>) => {
    return routes.map((route, index) => {
      return (
        <Route
          key={index}
          path={route.path}
          element={route.element}
          loader={route.loader}
        >
          {route.children && mapRoutes(route.children)}
        </Route>
      )
    })
  }

  return (
    <RouterProvider
      router={createBrowserRouter(
        createRoutesFromElements(mapRoutes([...routes, ...commonRoutes])),
      )}
    />
  )
}
