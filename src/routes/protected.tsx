import { ErrorBoundary } from 'react-error-boundary'
import { PATHS } from './PATHS'
import { lazyImport } from '~/utils/lazyImport'

import MainLayout from '~/layout/MainLayout'

import { OrgManagementRoutes } from '~/cloud/orgManagement'

import { ErrorFallback } from '~/pages/ErrorPage'

const { DeviceTemplateManage } = lazyImport(
  () => import('~/cloud/deviceTemplate'),
  'DeviceTemplateManage',
)
const { FlowEngine } = lazyImport(
  () => import('~/cloud/flowEngine'),
  'FlowEngine',
)
const { Dashboard } = lazyImport(() => import('~/cloud/dashboard'), 'Dashboard')
const { RoleManage } = lazyImport(() => import('~/cloud/role'), 'RoleManage')

export const protectedRoutes = [
  {
    element: <MainLayout />,
    children: [
      ...OrgManagementRoutes,
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
        path: PATHS.DASHBOARD,
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Dashboard />
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
        children: [{ path: ':projectId' }],
      },
    ],
  },
]
