import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useProjectIdStore } from '~/stores/project'
import { NavLink } from '~/components/Link'
import { PATHS } from '~/routes/PATHS'

import {
  OrgDeviceIcon,
  OrgEventIcon,
  OrgGroupIcon,
  OrgInfoIcon,
  OrgUserIcon,
} from '~/components/SVGIcons'

function OrgManageNavbar() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)
  const params = useParams()
  const orgId = params.orgId || ''

  return (
    <div className="flex h-[60px] items-center justify-between bg-secondary-400 px-3">
      <NavLink
        to={`${PATHS.ORG_MANAGE}/${projectId}${
          orgId === '' ? '' : `/${orgId}`
        }`}
        className="flex cursor-pointer gap-2"
      >
        <OrgInfoIcon
          className="text-secondary-700 group-hover:text-primary-400 group-[.active]:text-primary-400"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        />
        <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
          {t('cloud:org_manage.org_manage.title')}
        </p>
      </NavLink>
      <NavLink
        to={`${PATHS.GROUP_MANAGE}/${projectId}${
          orgId === '' ? '' : `/${orgId}`
        }`}
        className="flex cursor-pointer gap-2"
      >
        <OrgGroupIcon
          className="text-secondary-700 group-hover:text-primary-400 group-[.active]:text-primary-400"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        />
        <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
          {t('cloud:org_manage.group_manage.title')}
        </p>
      </NavLink>
      <NavLink
        to={`${PATHS.USER_MANAGE}/${projectId}${
          orgId === '' ? '' : `/${orgId}`
        }`}
        className="flex cursor-pointer gap-2"
      >
        <OrgUserIcon
          className="text-secondary-700 group-hover:text-primary-400 group-[.active]:text-primary-400"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        />
        <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
          {t('cloud:org_manage.user_manage.title')}
        </p>
      </NavLink>
      <NavLink
        to={`${PATHS.DEVICE_MANAGE}/${projectId}${
          orgId === '' ? '' : `/${orgId}`
        }`}
        className="flex cursor-pointer gap-2"
      >
        <OrgDeviceIcon
          className="text-secondary-700 group-hover:text-primary-400 group-[.active]:text-primary-400"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        />
        <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
          {t('cloud:org_manage.device_manage.title')}
        </p>
      </NavLink>
      <NavLink
        to={`${PATHS.EVENT_MANAGE}/${projectId}${
          orgId === '' ? '' : `/${orgId}`
        }`}
        className="flex cursor-pointer gap-2"
      >
        <OrgEventIcon
          className="text-secondary-700 group-hover:text-primary-400 group-[.active]:text-primary-400"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        />
        <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
          {t('cloud:org_manage.event_manage')}
        </p>
      </NavLink>
    </div>
  )
}

export default OrgManageNavbar
