import { PATHS } from '~/routes/PATHS'
import OrgManagementLayout from '~/layout/OrgManagementLayout'
import { DeviceManageLayout } from '../layout'
import OrgManage from './OrgManage'
import GroupManage from './GroupManage'
import UserManage from './UserManage'
import { DeviceManage } from './DeviceManage'
import { DeviceDetail } from './DeviceDetail'
import EventManage from './EventManage'
import RoleManage from './RoleManage'

export const OrgManagementRoutes = [
  {
    element: <OrgManagementLayout />,
    children: [
      {
        path: PATHS.ORG_MANAGEMENT,
        children: [
          {
            path: PATHS.ORG_MANAGE,
            element: <OrgManage />,
            children: [{ path: ':projectId/:orgId' }],
          },
          {
            path: PATHS.GROUP_MANAGE,
            element: <GroupManage />,
            children: [{ path: ':projectId/:orgId' }],
          },
          {
            path: PATHS.USER_MANAGE,
            element: <UserManage />,
            children: [{ path: ':projectId/:orgId' }],
          },
          {
            path: PATHS.DEVICE_MANAGE,
            element: <DeviceManageLayout />,
            children: [
              {
                path: ':projectId/:orgId',
                element: <DeviceManage />,
              },
              {
                path: ':projectId/:orgId/:deviceId',
                element: <DeviceDetail />,
              },
            ],
          },
          {
            path: PATHS.EVENT_MANAGE,
            element: <EventManage />,
            children: [{ path: ':projectId/:orgId' }],
          },
          {
            path: PATHS.ROLE_MANAGE,
            element: <RoleManage />,
            children: [{ path: ':projectId/:orgId' }],
          },
        ],
      },
    ],
  },
]
