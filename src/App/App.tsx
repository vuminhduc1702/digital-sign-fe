import '~/style/main.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RouteList } from '~/routes/RouteList'
import '~/i18n'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense, useState, useEffect } from 'react'
import { queryClient } from '~/lib/react-query'
import { Spinner } from '~/components/Spinner/Spinner'
import { ErrorBoundary } from 'react-error-boundary'

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
      <h2 className="text-lg font-semibold">
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
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          {process.env.NODE_ENV !== 'test' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
          {showDevtools && (
            <Suspense fallback={null}>
              <ReactQueryDevtoolsProduction />
            </Suspense>
          )}
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  )
}

export default App
