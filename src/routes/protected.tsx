import { ErrorBoundary } from 'react-error-boundary'
import { PATHS } from './PATHS'
import { lazyImport } from '~/utils/lazyImport'

import MainLayout from '~/layout/MainLayout'

import { OrgManagementRoutes } from '~/cloud/orgManagement'
import { FlowEngineV2Routes } from '~/cloud/flowEngineV2'
import { FirmWareRoutes } from '~/cloud/firmware'
import { CustomerManageRoutes } from '~/cloud/customerManage'

import { ErrorFallback } from '~/pages/ErrorPage'
import { ProjectManagementRoutes } from '~/cloud/project'
import { DashboardManagementRoutes } from '~/cloud/dashboard/routes'
import { SubscriptionRoutes } from '~/cloud/subcription/routes'
import { BillingRoutes } from '~/cloud/billing/routes'

import { ChangePassword } from '~/features/auth/routes/ChangePassword'
import { DeviceRoutes } from '~/device/routes'
import { ApplicationRoutes } from '~/applicationPages'
import SelfAccount from '~/layout/MainLayout/components/UserAccount/SelfAccount'
import { AiRoutes } from '~/cloud/ai'
import MainTenant from '~/cloud/tenant/MainTenant'
import DevRole from '~/cloud/devRole/DevRole'
import { TemplateSidebar } from '~/cloud/deviceTemplate/components'


const { DeviceTemplateManage } = lazyImport(
  () => import('~/cloud/deviceTemplate'),
  'DeviceTemplateManage',
)
const { DeviceTemplatelwm2mManage } = lazyImport(
  () => import('~/cloud/deviceTemplate'),
  'DeviceTemplatelwm2mManage',
)
const { BillingPackageManage } = lazyImport(
  () => import('~/cloud/billingPackage'),
  'BillingPackageManage',
)
const { OverViewManage } = lazyImport(
  () => import('~/cloud/overView'),
  'OverViewManage',
)
const { FlowEngine } = lazyImport(
  () => import('~/cloud/flowEngine'),
  'FlowEngine',
)
const { RoleManage } = lazyImport(() => import('~/cloud/role'), 'RoleManage')
const { CustomProtocolManage } = lazyImport(
  () => import('~/cloud/customProtocol'),
  'CustomProtocolManage',
)
export const protectedRoutes = [
  {
    element: <MainLayout />,
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
            <DeviceTemplateManage />
          </ErrorBoundary>
        ),
        children: [{ path: ':projectId', children: [{ path: ':templateId' }] }],
      },
      {
        path: PATHS.DEVICE_TEMPLATELWM2M,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DeviceTemplatelwm2mManage />
          </ErrorBoundary>
        ),
        children: [{ path: ':projectId', children: [{ path: ':lwm2m/:templateId' }, { path: ':lwm2m/:templateId/:id' }] }],
      },
      {
        path: PATHS.FLOW_ENGINE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <FlowEngine />
          </ErrorBoundary>
        ),
        children: [{ path: ':projectId' }],
      },
      {
        path: PATHS.ROLE_MANAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <RoleManage />
          </ErrorBoundary>
        ),
        children: [{ path: ':projectId', children: [{ path: ':roleId' }] }],
      },
      {
        path: PATHS.CUSTOM_PROTOCOL,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <CustomProtocolManage />
          </ErrorBoundary>
        ),
        children: [{ path: ':projectId' }],
      },
      {
        path: PATHS.BILLING_PACKAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <BillingPackageManage />
          </ErrorBoundary>
        ),
        children: [{ path: ':projectId', children: [{ path: ':packageId' }] }],
      },
      {
        path: PATHS.OVER_VIEW,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <OverViewManage />
          </ErrorBoundary>
        ),
        children: [{ path: ':projectId', children: [{ path: ':packageId' }] }],
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
            <ChangePassword />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.USER_INFO,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <SelfAccount />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.TENANT_MANAGE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <MainTenant />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.DEV_ROLE,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DevRole />
          </ErrorBoundary>
        ),
      },
    ],
  },
]
