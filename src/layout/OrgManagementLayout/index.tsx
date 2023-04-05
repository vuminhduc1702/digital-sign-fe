import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { Button } from '~/components/Button'
import { InputField } from '~/components/Form'
import { NavLink } from '~/components/Link'
import { PATHS } from '~/routes/PATHS'
import { useOrganizations } from '../MainLayout/api/getOrgs'
import { useProjectIdStore } from '~/stores/project'
import { useOrgIdStore } from '~/stores/org'

import { type Org } from '../MainLayout/types'

import {
  OrgDeviceIcon,
  OrgEventIcon,
  OrgGroupIcon,
  OrgInfoIcon,
  OrgRoleIcon,
  OrgUserIcon,
  PlusIcon,
  SearchIcon,
} from '~/components/SVGIcons'
import listIcon from '~/assets/icons/list.svg'
import { ComboBox, extractedComboboxData } from '~/components/ComboBox'

function OrgManagementLayout() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)
  const projectName = useProjectIdStore(state => state.projectName)
  const { data: orgData, isLoading: isLoadingOrg } = useOrganizations({
    projectId,
  })
  const setOrgId = useOrgIdStore(state => state.setOrgId)

  function renderSubOrgs(org: Org) {
    if (!org.sub_orgs || org.sub_orgs.length === 0) {
      return null
    }

    return (
      <ul className="ml-4">
        {org.sub_orgs.map((subOrg: Org) => (
          <li
            key={subOrg.id}
            className="cursor-pointer space-y-3"
            onClick={e => {
              e.stopPropagation()
              setOrgId(subOrg.id)
            }}
          >
            <p>{subOrg.name}</p>
            {renderSubOrgs(subOrg)}
          </li>
        ))}
      </ul>
    )
  }

  const comboboxData = extractedComboboxData(
    orgData?.organizations as Array<Org>,
    ['id', 'name'],
    'sub_orgs',
  )

  return (
    <>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex flex-col gap-2 md:col-span-1">
          <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
            <div className="flex gap-3">
              <img
                src={listIcon}
                alt="Organization list"
                className="aspect-square w-[20px]"
              />
              <p>{t('cloud.org_manage.org_list')}</p>
            </div>
            <Button
              variant="trans"
              size="square"
              startIcon={
                <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
              }
            />
            <InputField
              startIcon={
                <SearchIcon
                  className="absolute top-1/2 left-0 ml-2 -translate-y-1/2 transform"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                />
              }
            />
            {/* TODO: Handle loading state more beautiful */}
            {!isLoadingOrg ? <ComboBox data={comboboxData} /> : <p>...</p>}
          </div>
          <div className="grow bg-secondary-500 p-3">
            <ul className="space-y-3">
              {projectName}
              {orgData?.organizations.map((org: Org) => (
                <li
                  className="flex cursor-pointer flex-col gap-y-3"
                  key={org.id}
                  onClick={() => setOrgId(org.id)}
                >
                  <p>{org.name}</p>
                  {renderSubOrgs(org)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 md:col-span-2">
          <div className="flex h-[60px] items-center justify-between bg-secondary-400 px-3">
            <NavLink
              to={PATHS.ORG_INFO.replace(':projectId', projectId)}
              className="group flex cursor-pointer gap-2 hover:text-primary-400"
            >
              <OrgInfoIcon
                className="text-secondary-700 group-hover:text-primary-400"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              />
              <p>{t('cloud.org_manage.org_list')}</p>
            </NavLink>
            <NavLink
              to={PATHS.GROUP_MANAGE.replace(':projectId', projectId)}
              className="group flex cursor-pointer gap-2 hover:text-primary-400"
            >
              <OrgGroupIcon
                className="text-secondary-700 group-hover:text-primary-400"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              />
              <p>{t('cloud.org_manage.group_manage')}</p>
            </NavLink>
            <NavLink
              to={PATHS.USER_MANAGE.replace(':projectId', projectId)}
              className="group flex cursor-pointer gap-2 hover:text-primary-400"
            >
              <OrgUserIcon
                className="text-secondary-700 group-hover:text-primary-400"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              />
              <p>{t('cloud.org_manage.user_manage')}</p>
            </NavLink>
            <NavLink
              to={PATHS.DEVICE_MANAGE.replace(':projectId', projectId)}
              className="group flex cursor-pointer gap-2 hover:text-primary-400"
            >
              <OrgDeviceIcon
                className="text-secondary-700 group-hover:text-primary-400"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              />
              <p>{t('cloud.org_manage.device_manage')}</p>
            </NavLink>
            <NavLink
              to={PATHS.EVENT_MANAGE.replace(':projectId', projectId)}
              className="group flex cursor-pointer gap-2 hover:text-primary-400"
            >
              <OrgEventIcon
                className="text-secondary-700 group-hover:text-primary-400"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              />
              <p>{t('cloud.org_manage.event_manage')}</p>
            </NavLink>
            <NavLink
              to={PATHS.ROLE_MANAGE.replace(':projectId', projectId)}
              className="group flex cursor-pointer gap-2 hover:text-primary-400"
            >
              <OrgRoleIcon
                className="text-secondary-700 group-hover:text-primary-400"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              />
              <p>{t('cloud.org_manage.role_manage')}</p>
            </NavLink>
          </div>
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default OrgManagementLayout
