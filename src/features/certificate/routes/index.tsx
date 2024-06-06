import { AnimatedWrapper } from "@/components/Animated";
import { ErrorFallback } from "@/pages/ErrorPage";
import { PATHS } from "@/routes/PATHS";
import { ErrorBoundary } from "react-error-boundary";
import { CertificatePage } from "./CertificatePage";

export const CertificateRoutes = [
    {
        path: PATHS.CERTIFICATE,
        element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                    <CertificatePage />
                </AnimatedWrapper>
            </ErrorBoundary>
        )
    }
]