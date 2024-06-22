import { AnimatedWrapper } from "@/components/Animated";
import { ErrorFallback } from "@/pages/ErrorPage";
import { PATHS } from "@/routes/PATHS";
import { ErrorBoundary } from "react-error-boundary";
import { RequestPage } from "./RequestPage";

export const RequestRoutes = [
    {
        path: PATHS.REQUEST,
        element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <RequestPage />
            </AnimatedWrapper>
          </ErrorBoundary>    
        )
    }
]