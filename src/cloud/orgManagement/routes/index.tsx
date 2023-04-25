import { PATHS } from '~/routes/PATHS'
import OrgManagementLayout from '~/layout/OrgManagementLayout'
import OrgManage from './OrgManage'
import GroupManage from './GroupManage'
import UserManage from './UserManage'
import DeviceManage from './DeviceManage'
import EventManage from './EventManage'
import RoleManage from './RoleManage'
import { DeviceDetail } from '../components/Device'

export const OrgManagementRoutes = [
  {
    element: <OrgManagementLayout />,
    children: [
      {
        path: PATHS.ORG_MANAGEMENT,
        children: [
          {
            path: PATHS.ORG_MANAGE_CHILD,
            element: <OrgManage />,
            children: [{ path: ':orgId' }],
          },
          {
            path: PATHS.GROUP_MANAGE_CHILD,
            element: <GroupManage />,
            children: [{ path: ':orgId' }],
          },
          {
            path: PATHS.USER_MANAGE_CHILD,
            element: <UserManage />,
            children: [{ path: ':orgId' }],
          },
          {
            path: PATHS.DEVICE_MANAGE_CHILD,
            element: <DeviceManage />,
            children: [{ path: ':orgId' }],
          },
          { path: ':orgId/:deviceId', element: <DeviceDetail /> },
          {
            path: PATHS.EVENT_MANAGE_CHILD,
            element: <EventManage />,
            children: [{ path: ':orgId' }],
          },
          {
            path: PATHS.ROLE_MANAGE_CHILD,
            element: <RoleManage />,
            children: [{ path: ':orgId' }],
          },
        ],
      },
    ],
  },
]
