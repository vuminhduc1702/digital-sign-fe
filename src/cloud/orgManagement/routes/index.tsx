import { PATHS } from '~/routes/PATHS'
import OrgManagementLayout from '~/layout/OrgManagementLayout'
import OrgInfo from './OrgInfo'
import GroupManage from './GroupManage'
import UserManage from './UserManage'
import DeviceManage from './DeviceManage'
import EventManage from './EventManage'
import RoleManage from './RoleManage'

export const OrgManagementRoutes = [
  {
    element: <OrgManagementLayout />,
    children: [
      {
        index: true,
        path: PATHS.ORG_INFO,
        element: <OrgInfo />,
      },
      {
        path: PATHS.GROUP_MANAGE,
        element: <GroupManage />,
      },
      {
        path: PATHS.USER_MANAGE,
        element: <UserManage />,
      },
      {
        path: PATHS.DEVICE_MANAGE,
        element: <DeviceManage />,
      },
      {
        path: PATHS.EVENT_MANAGE,
        element: <EventManage />,
      },
      {
        path: PATHS.ROLE_MANAGE,
        element: <RoleManage />,
      },
    ],
  },
]
