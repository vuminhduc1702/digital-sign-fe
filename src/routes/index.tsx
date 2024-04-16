import { useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { BASE_PATH, PATHS } from './PATHS'
import { useUser } from '~/lib/auth'
import { lazyImport } from '~/utils/lazyImport'
import { protectedRoutes } from './protected'
import { publicRoutes } from './public'
import { ErrorFallback } from '~/pages/ErrorPage'
import { PDFViewer } from '~/pages/LandingPage/components/PdfViewer'

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

  const { data: userDataFromStorage } = useUser()

  const commonRoutes = [
    // { path: BASE_PATH, element: <LandingPage /> },
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
    {
      path: PATHS.PDF_VIEWER,
      element: (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <PDFViewer />
        </ErrorBoundary>
      ),
    },
  ]

  const isNotAuthRoutes =
    location.pathname !== PATHS.FORGETPASSWORD &&
    location.pathname !== PATHS.REGISTER &&
    location.pathname !== PATHS.LOGIN
  const isAuthRoutes =
    location.pathname === PATHS.FORGETPASSWORD ||
    location.pathname === PATHS.REGISTER ||
    location.pathname === PATHS.LOGIN

  useEffect(() => {
    if (
      userDataFromStorage == null &&
      isNotAuthRoutes &&
      !commonRoutes.some(item => item.path === location.pathname)
    ) {
      navigate(PATHS.LOGIN, { state: { from: location }, replace: true })
    }

    if (userDataFromStorage != null && isAuthRoutes) {
      navigate(PATHS.PROJECT_MANAGE)
    }
  }, [location.pathname, userDataFromStorage, isAuthRoutes])

  const routes = userDataFromStorage ? protectedRoutes : publicRoutes

  const element = useRoutes([...routes, ...commonRoutes])

  return <>{element}</>
}
