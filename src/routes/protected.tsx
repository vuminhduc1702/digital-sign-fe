import { ErrorBoundary } from 'react-error-boundary'
import { PATHS } from './PATHS'
import { lazyImport } from '~/utils/lazyImport'

import MainLayout from '~/layout/MainLayout'

import { OrgManagementRoutes } from '~/cloud/orgManagement'

import { ErrorFallback } from '~/pages/ErrorPage'
import { ProjectManagementRoutes } from '~/cloud/project'
import { DashboardManagementRoutes } from '~/cloud/dashboard/routes'

const { DeviceTemplateManage } = lazyImport(
  () => import('~/cloud/deviceTemplate'),
  'DeviceTemplateManage',
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
      ...ProjectManagementRoutes,
      ...DashboardManagementRoutes,
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
    ],
  },
]
