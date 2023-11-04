import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense, useState, useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { disableReactDevTools } from '@fvilers/disable-react-devtools'

import '~/style/main.css'
import '~/i18n'

import storage from '~/utils/storage'
import { lazyImport } from '~/utils/lazyImport'
import { queryClient } from '~/lib/react-query'
import { Spinner } from '~/components/Spinner'
import { Notifications } from '~/components/Notifications'
import { AuthLoader, logoutFn } from '~/lib/auth'
import { AppRoutes } from '~/routes'
const { ErrorFallback } = lazyImport(
  () => import('~/pages/ErrorPage'),
  'ErrorFallback',
)

const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/lib/index.prod.js').then(d => ({
    default: d.ReactQueryDevtools,
  })),
)

function App() {
  const [showDevtools, setShowDevtools] = useState(false)

  useEffect(() => {
    // @ts-ignore
    window.toggleDevtools = () => setShowDevtools(old => !old)
  }, [])

  useEffect(() => {
    const userStorage = storage.getToken()
    if (
      userStorage &&
      new Date().getTime() - new Date(userStorage?.timestamp).getTime() >
        24 * 60 * 60 * 1000
    ) {
      logoutFn()
    }
  }, [])

  if (import.meta.env.NODE_ENV === 'production') {
    disableReactDevTools()
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner size="xl" />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <Notifications />
            <AuthLoader
              renderLoading={() => (
                <div className="flex h-screen w-screen items-center justify-center">
                  <Spinner size="xl" />
                </div>
              )}
            >
              <Router>
                <AppRoutes />
              </Router>
            </AuthLoader>
            {import.meta.env.NODE_ENV !== 'test' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
            {showDevtools && (
              <Suspense fallback={null}>
                <ReactQueryDevtoolsProduction />
              </Suspense>
            )}
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </Suspense>
  )
}

export default App
