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

const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/lib/index.prod.js').then(d => ({
    default: d.ReactQueryDevtools,
  })),
)

function App() {
  const { t } = useTranslation()

  // Dev tools
  const [showDevtools, setShowDevtools] = useState(false)
  useEffect(() => {
    // @ts-ignore
    window.toggleDevtools = () => setShowDevtools(old => !old)
  }, [])
  if (import.meta.env.PROD) {
    disableReactDevTools()
  }

  // Global error messages
  const customErrorMap: z.ZodErrorMap = (error, ctx) => {
    switch (error.code) {
      case z.ZodIssueCode.invalid_type:
        if (error.expected === 'string' || error.expected === 'object') {
          return {
            message: `${t('error:default_zod_err.select')} ${error.path[0]}`,
          }
        }
        if (error.expected === 'number') {
          return {
            message: t('error:default_zod_err.number'),
          }
        }
        break
      case z.ZodIssueCode.invalid_union_discriminator:
      case z.ZodIssueCode.invalid_enum_value:
        return {
          message: `${t(
            'error:default_zod_err.select_union',
          )} ${error.options.join(', ')}`,
        }
      case z.ZodIssueCode.custom:
        const params = error.params || {}
        if (params.myField) {
          return { message: `${t('error:wrong_input')} ${params.myField}` }
        }
        break
    }

    return { message: ctx.defaultError }
  }
  if (import.meta.env.PROD) {
    z.setErrorMap(customErrorMap)
  }

  if (import.meta.env.PROD) {
    console.log = () => {}
    console.error = () => {}
    console.debug = () => {}
  }

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
            {import.meta.env.PROD && (
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
