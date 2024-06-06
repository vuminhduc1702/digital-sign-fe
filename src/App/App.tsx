import { ErrorBoundary } from 'react-error-boundary'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense, useState, useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { disableReactDevTools } from '@fvilers/disable-react-devtools'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import '@/i18n'
import { lazyImport } from '@/utils/lazyImport'
import { queryClient } from '@/lib/react-query'
import { AuthLoader } from '@/lib/auth'
import { AppRoutes } from '@/routes'
import { Toaster } from '@/components/ui/sonner'

import '@/style/main.css'
import { SkeletonLoading } from '@/components/Skeleton'

const { ErrorFallback } = lazyImport(
  () => import('@/pages/ErrorPage'),
  'ErrorFallback',
)

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <SkeletonLoading type="full" />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster
              position="top-right"
              closeButton
              richColors
              duration={5000}
              visibleToasts={10}
            />
            <AuthLoader
              renderLoading={() => (
                <div className="flex h-screen w-screen items-center justify-center">
                  <SkeletonLoading type="full" />
                </div>
              )}
            >
              <AppRoutes />
            </AuthLoader>
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </Suspense>
  )
}

export default App
