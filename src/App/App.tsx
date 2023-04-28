import { ErrorBoundary } from 'react-error-boundary'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense, useState, useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'

import '~/style/main.css'
import '~/i18n'
import { RouteList } from '~/routes/RouteList'
import { queryClient } from '~/lib/react-query'
import { Spinner } from '~/components/Spinner'
import { Notifications } from '~/components/Notifications'

const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/lib/index.prod.js').then(d => ({
    default: d.ReactQueryDevtools,
  })),
)

const ErrorFallback = () => {
  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center text-red-500"
      role="alert"
    >
      <h2 className="text-body-md font-semibold">
        Ooops, có lỗi rùi, bạn click nút Refresh để tải lại trang nhé :({' '}
      </h2>
      <button
        className="mt-4"
        onClick={() => window.location.assign(window.location.origin)}
      >
        Refresh
      </button>
    </div>
  )
}

function App() {
  const routerList = RouteList()
  const router = createBrowserRouter([...routerList])

  const [showDevtools, setShowDevtools] = useState(false)

  useEffect(() => {
    // @ts-ignore
    window.toggleDevtools = () => setShowDevtools(old => !old)
  }, [])

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
            <RouterProvider router={router} />
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
