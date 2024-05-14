import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  type RouteObject,
  RouterProvider,
} from 'react-router-dom'
import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { PATHS } from './PATHS'
import { useUser } from '@/lib/auth'
import { lazyImport } from '@/utils/lazyImport'
import { protectedRoutes } from './protected'
import { publicRoutes } from './public'
import { ErrorFallback } from '@/pages/ErrorPage'
import { PDFViewer } from '@/pages/LandingPage/components/PdfViewer'
import { endProgress, startProgress } from '@/components/Progress'
import { useProjectIdStore } from '@/stores/project'
import storage from '@/utils/storage'

const { LandingPage } = lazyImport(
  () => import('@/pages/LandingPage'),
  'LandingPage',
)
const { MaintainPage } = lazyImport(
  () => import('@/pages/MaintainPage'),
  'MaintainPage',
)
const { NotFoundPage } = lazyImport(
  () => import('@/pages/NotFoundPage'),
  'NotFoundPage',
)
const { VersionPage } = lazyImport(
  () => import('@/pages/VersionPage'),
  'VersionPage',
)

export const AppRoutes = () => {
  const projectIdFromURL = window.location.pathname.split('/').at(-1)
  const projectIdFromZustand = useProjectIdStore(state => state.projectId)
  const projectId =
    projectIdFromURL ?? projectIdFromZustand ?? storage.getProject()?.id

  const { data: userDataFromStorage } = useUser()

  const commonRoutes = [
    // { path: BASE_PATH, element: <LandingPage /> },
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
    {
      path: PATHS.VERSION,
      element: <VersionPage />,
      loader: async () => {
        startProgress()
        await import('@/pages/VersionPage')
        endProgress()

        return null
      },
    },
    {
      path: PATHS.PDF_VIEWER,
      element: (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <PDFViewer />
        </ErrorBoundary>
      ),
      loader: async () => {
        startProgress()
        await import('@/pages/LandingPage/components/PdfViewer')
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
    if (
      (userDataFromStorage != null && isAuthRoutes) ||
      (userDataFromStorage != null && projectId == null)
    ) {
      window.location.href = PATHS.PROJECT_MANAGE
    }
  }, [isAuthRoutes, projectId, userDataFromStorage])

  const routes = userDataFromStorage ? protectedRoutes : publicRoutes

  const mapRoutes = (routes: Readonly<RouteObject[]>) => {
    return routes.map(route => (
      <Route
        key={route.path}
        path={route.path}
        element={route.element}
        loader={route.loader}
      >
        {route.children && mapRoutes(route.children)}
      </Route>
    ))
  }

  return (
    <RouterProvider
      router={createBrowserRouter(
        createRoutesFromElements(mapRoutes([...routes, ...commonRoutes])),
      )}
    />
  )
}
