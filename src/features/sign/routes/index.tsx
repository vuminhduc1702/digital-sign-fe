import { AnimatedWrapper } from '@/components/Animated'
import { ErrorFallback } from '@/pages/ErrorPage'
import { PATHS } from '@/routes/PATHS'
import { ErrorBoundary } from 'react-error-boundary'
import { SignPage } from './SignPage'

export const SignRoutes = [
  {
    path: PATHS.SIGN,
    element: (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AnimatedWrapper>
          <SignPage />
        </AnimatedWrapper>
      </ErrorBoundary>
    ),
  },
]
