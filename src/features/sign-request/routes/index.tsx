import { AnimatedWrapper } from "@/components/Animated";
import { PATHS } from "@/routes/PATHS";
import { ErrorBoundary } from "react-error-boundary";
import { SignRequestPage } from "./SignRequestPage";
import { ErrorFallback } from "@/pages/ErrorPage";

export const SignRequestRoutes = [
    {
        path: PATHS.SIGN_REQUEST,
        element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                    <SignRequestPage />
                </AnimatedWrapper>
            </ErrorBoundary>
        )
    }
]