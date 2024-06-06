import { AnimatedWrapper } from '@/components/Animated'
import { ErrorFallback } from '@/pages/ErrorPage'
import { PATHS } from '@/routes/PATHS'
import { ErrorBoundary } from 'react-error-boundary'
import { HistoryPage } from './HistoryPage'

export const HistoryRoutes = [
  {
    path: PATHS.HISTORY,
    element: (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AnimatedWrapper>
          <HistoryPage />
        </AnimatedWrapper>
      </ErrorBoundary>
    ),
  },
]
