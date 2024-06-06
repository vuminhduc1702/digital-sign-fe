import MainLayout from '@/layout/MainLayout'

import { type RouteObject } from 'react-router-dom'

import { endProgress, startProgress } from '@/components/Progress'
import { SignRoutes } from '@/features/sign/routes'
import { HistoryRoutes } from '@/features/history/routes'
import { VerifyRoutes } from '@/features/verify/routes'
import { CertificateRoutes } from '@/features/certificate/routes'

export const protectedRoutes = [
  {
    element: <MainLayout />,
    loader: async () => {
      startProgress()
      await import('@/layout/MainLayout')
      endProgress()

      return null
    },
    children: [
      ...SignRoutes,
      ...HistoryRoutes,
      ...VerifyRoutes,
      ...CertificateRoutes,
    ],
  },
] as const satisfies RouteObject[]
