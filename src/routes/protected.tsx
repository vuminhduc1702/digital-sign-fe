import { ErrorBoundary } from 'react-error-boundary'
import { PATHS } from './PATHS'
import { lazyImport } from '@/utils/lazyImport'

import MainLayout from '@/layout/MainLayout'

import { OrgManagementRoutes } from '@/cloud/orgManagement'
import { FlowEngineV2Routes } from '@/cloud/flowEngineV2'
import { FirmWareRoutes } from '@/cloud/firmware'
import { CustomerManageRoutes } from '@/cloud/customerManage'

import { ErrorFallback } from '@/pages/ErrorPage'
import { ProjectManagementRoutes } from '@/cloud/project'
import { DashboardManagementRoutes } from '@/cloud/dashboard/routes'
import { SubscriptionRoutes } from '@/cloud/subcription/routes'
import { BillingRoutes } from '@/cloud/billing/routes'

import { ChangePassword } from '@/features/auth/routes/ChangePassword'
import { DeviceRoutes } from '@/device/routes'
import { ApplicationRoutes } from '@/applicationPages'
import SelfAccount from '@/layout/MainLayout/components/UserAccount/SelfAccount'
import { AiRoutes } from '@/cloud/ai'
import MainTenant from '@/cloud/tenant/MainTenant'
import DevRole from '@/cloud/devRole/DevRole'
import { Default } from '@/cloud/deviceTemplate/routes/Default'
import { LwM2M } from '@/cloud/deviceTemplate/routes/LwM2M'
import { Navigate, type RouteObject } from 'react-router-dom'

import storage from '@/utils/storage'
import { Authorization } from '@/lib/authorization'
import { endProgress, startProgress } from '@/components/Progress'
import { AnimatedWrapper } from '@/components/Animated'

const projectId = storage.getProject()
const { DeviceTemplateManage } = lazyImport(
  () => import('@/cloud/deviceTemplate'),
  'DeviceTemplateManage',
)
const { BillingPackageManage } = lazyImport(
  () => import('@/cloud/billingPackage'),
  'BillingPackageManage',
)
const { OverViewManage } = lazyImport(
  () => import('@/cloud/overView'),
  'OverViewManage',
)
const { RoleManage } = lazyImport(() => import('@/cloud/role'), 'RoleManage')
const { CustomProtocolManage } = lazyImport(
  () => import('@/cloud/customProtocol'),
  'CustomProtocolManage',
)
const { DataBaseTemplateManage } = lazyImport(
  () => import('@/cloud/databaseTemplate'),
  'DataBaseTemplateManage',
)
const { ForbiddenPage } = lazyImport(
  () => import('@/pages/ForbiddenPage'),
  'ForbiddenPage',
)

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
      ...OrgManagementRoutes,
      ...FlowEngineV2Routes,
      ...DashboardManagementRoutes,
      ...FirmWareRoutes,
      ...SubscriptionRoutes,
      ...DeviceRoutes,
      ...BillingRoutes,
      ...ApplicationRoutes,
      ...AiRoutes,
      ...CustomerManageRoutes,
      {
        path: PATHS.DEVICE_TEMPLATE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <DeviceTemplateManage />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('@/cloud/deviceTemplate')
          endProgress()

          return null
        },
        children: [
          {
            index: true,
            element: (
              <Navigate
                to={`${
                  projectId != null
                    ? PATHS.TEMPLATE_DEFAULT + '/' + projectId.id
                    : PATHS.TEMPLATE_DEFAULT + '/' + projectId
                }`}
                replace
              />
            ),
          },
          {
            path: PATHS.TEMPLATE_DEFAULT,
            children: [
              {
                path: ':projectId',
                element: (
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <AnimatedWrapper>
                      <Default />
                    </AnimatedWrapper>
                  </ErrorBoundary>
                ),
                loader: async () => {
                  startProgress()
                  await import('@/cloud/deviceTemplate/routes/Default')
                  endProgress()

                  return null
                },
                children: [{ path: ':templateId' }],
              },
            ],
          },
          {
            path: PATHS.TEMPLATE_LWM2M,
            children: [
              {
                path: ':projectId',
                element: (
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <AnimatedWrapper>
                      <LwM2M />
                    </AnimatedWrapper>
                  </ErrorBoundary>
                ),
                loader: async () => {
                  startProgress()
                  await import('@/cloud/deviceTemplate/routes/LwM2M')
                  endProgress()

                  return null
                },
                children: [
                  { path: ':templateId' },
                  { path: ':templateId/:id' },
                ],
              },
            ],
          },
        ],
      },
      {
        path: PATHS.ROLE_MANAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <RoleManage />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('@/cloud/role')
          endProgress()

          return null
        },
        children: [{ path: ':projectId', children: [{ path: ':roleId' }] }],
      },
      {
        path: PATHS.CUSTOM_PROTOCOL,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <CustomProtocolManage />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('@/cloud/customProtocol')
          endProgress()

          return null
        },
        children: [{ path: ':projectId' }],
      },
      {
        path: PATHS.BILLING_PACKAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <BillingPackageManage />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('@/cloud/billingPackage')
          endProgress()

          return null
        },
        children: [{ path: ':projectId', children: [{ path: ':packageId' }] }],
      },
      {
        path: PATHS.OVER_VIEW,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <OverViewManage />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('@/cloud/overView')
          endProgress()

          return null
        },
        children: [{ path: ':projectId', children: [{ path: ':packageId' }] }],
      },
      {
        path: PATHS.DB_TEMPLATE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <DataBaseTemplateManage />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('@/cloud/databaseTemplate')
          endProgress()

          return null
        },
        children: [{ path: ':projectId', children: [{ path: ':tableName' }] }],
      },
    ],
  },
  {
    element: <MainLayout hasSideBar={false} />,
    children: [
      ...ProjectManagementRoutes,
      {
        path: PATHS.CHANGEPASSWORD,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <ChangePassword />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('@/features/auth/routes/ChangePassword')
          endProgress()

          return null
        },
      },
      {
        path: PATHS.USER_INFO,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <SelfAccount />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('@/layout/MainLayout/components/UserAccount/SelfAccount')
          endProgress()

          return null
        },
      },
      {
        path: PATHS.TENANT_MANAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Authorization
              allowedRoles={['SYSTEM_ADMIN', 'TENANT']}
              forbiddenFallback={<ForbiddenPage />}
            >
              <AnimatedWrapper>
                <MainTenant />
              </AnimatedWrapper>
            </Authorization>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('@/cloud/tenant/MainTenant')
          endProgress()

          return null
        },
      },
      {
        path: PATHS.DEV_ROLE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AnimatedWrapper>
              <DevRole />
            </AnimatedWrapper>
          </ErrorBoundary>
        ),
        loader: async () => {
          startProgress()
          await import('@/cloud/devRole/DevRole')
          endProgress()

          return null
        },
      },
    ],
  },
] as const satisfies RouteObject[]
