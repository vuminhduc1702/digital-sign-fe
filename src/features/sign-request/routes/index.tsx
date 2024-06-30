import { AnimatedWrapper } from "@/components/Animated";
import { PATHS } from "@/routes/PATHS";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/pages/ErrorPage";
import { RouteObject } from "react-router-dom";
import { endProgress, startProgress } from "@/components/Progress";
import { lazyImport } from "@/utils/lazyImport";
import { SignRequestPage } from "./SignRequestPage";

const {SignRequestDetail} = lazyImport(
    () => import('../components/detail/SignRequestDetail'),
    "SignRequestDetail"
)

export const SignRequestRoutes = [
    {
        path: PATHS.SIGN_REQUEST,
        element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                    <SignRequestPage />
                </AnimatedWrapper>
            </ErrorBoundary>
        ),
    },
    {
        path: `${PATHS.SIGN_REQUEST}/:requestId`,
        element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                    <SignRequestDetail />
                </AnimatedWrapper>
            </ErrorBoundary>
        ),
        loader: async () => {
            startProgress()
            await import ('../components/detail/SignRequestDetail')
            endProgress()
            return null
        }
    }
] as const satisfies RouteObject[]