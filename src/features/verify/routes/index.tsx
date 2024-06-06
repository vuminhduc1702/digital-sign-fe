import { AnimatedWrapper } from '@/components/Animated'
import { ErrorFallback } from '@/pages/ErrorPage'
import { PATHS } from '@/routes/PATHS'
import { ErrorBoundary } from 'react-error-boundary'
import { VerifyPage } from './VerifyPage'

export const VerifyRoutes = [
  {
    path: PATHS.VERIFY,
    element: (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AnimatedWrapper>
          <VerifyPage />
        </AnimatedWrapper>
      </ErrorBoundary>
    ),
  },
]
