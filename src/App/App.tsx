import '~/style/main.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RouteList } from '~/routes/RouteList'
import '~/i18n'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense, useState, useEffect } from 'react'
import { queryClient } from '~/lib/react-query'

const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/lib/index.prod.js').then(d => ({
    default: d.ReactQueryDevtools,
  })),
)

function App() {
  const routerList = RouteList()
  const router = createBrowserRouter([...routerList])

  const [showDevtools, setShowDevtools] = useState(false)

  useEffect(() => {
    // @ts-ignore
    window.toggleDevtools = () => setShowDevtools(old => !old)
  }, [])

  return (
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
  )
}

export default App
