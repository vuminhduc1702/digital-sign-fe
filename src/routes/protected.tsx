import { ErrorBoundary } from 'react-error-boundary'
import { PATHS } from './PATHS'
import { lazyImport } from '~/utils/lazyImport'

import MainLayout from '~/layout/MainLayout'

import { OrgManagementRoutes } from '~/cloud/orgManagement'
import { FlowEngineV2Routes } from '~/cloud/flowEngineV2'
import { FirmWareRoutes } from '~/cloud/firmware'

import { ErrorFallback } from '~/pages/ErrorPage'
import { ProjectManagementRoutes } from '~/cloud/project'
import { DashboardManagementRoutes } from '~/cloud/dashboard/routes'
import { SubcriptionRoutes } from '~/cloud/subcription/routes'
import { BillingRoutes } from '~/cloud/billing/routes'

import { ChangePassword } from '~/features/auth/routes/ChangePassword'
import { DeviceRoutes } from '~/device/routes'
import SelfAccount from '~/layout/MainLayout/components/UserAccount/SelfAccount'
import { AiRoutes } from '~/cloud/ai'

const { DeviceTemplateManage } = lazyImport(
  () => import('~/cloud/deviceTemplate'),
  'DeviceTemplateManage',
)
const { BillingPackageManage } = lazyImport(
  () => import('~/cloud/billingPackage'),
  'BillingPackageManage',
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
      ...ProjectManagementRoutes,
      ...DashboardManagementRoutes,
      ...FirmWareRoutes,
      ...SubcriptionRoutes,
      ...DeviceRoutes,
      ...BillingRoutes,
      ...AiRoutes,
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
        path: PATHS.USER_ACCOUNT,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <SelfAccount />
          </ErrorBoundary>
        )
      },
    ],
  },
  {
    path: PATHS.CHANGEPASSWORD,
    element: <ChangePassword />,
  },
]
