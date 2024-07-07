import { AnimatedWrapper } from "@/components/Animated";
import { PATHS } from "@/routes/PATHS";
import { ErrorBoundary } from "react-error-boundary";
import { GroupPage } from "./GroupPage";
import { ErrorFallback } from "@/pages/ErrorPage";
import { RouteObject } from "react-router-dom";
import { endProgress, startProgress } from "@/components/Progress";
import { lazyImport } from "@/utils/lazyImport";

const {GroupDetail} = lazyImport(
    () => import('../components/groupDetail/components/GroupDetail'),
    'GroupDetail'
)

export const GroupRoutes = [
    {
        path: PATHS.GROUP,
        element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                    <GroupPage />
                </AnimatedWrapper>
            </ErrorBoundary>
        )
    },
    {
        path: `${PATHS.GROUP}/:groupId`,
        element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AnimatedWrapper>
                    <GroupDetail />
                </AnimatedWrapper>
            </ErrorBoundary>
        ),
        loader: async () => {
            startProgress()
            await import ('../components/groupDetail/components/GroupDetail')
            endProgress()
            return null
        }
    }
] as const satisfies RouteObject[]