import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { NavLink } from '~/components/Link'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'

import { OrgGroupIcon, OrgInfoIcon, OrgUserIcon } from '~/components/SVGIcons'

function FlowEngineV2Navbar() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()
  const params = useParams()
  const orgId = params.orgId || ''

  return (
    <div className="flex h-[60px] items-center justify-between bg-secondary-400 px-10">
      <NavLink
        to={`${PATHS.THING_TEMPLATE}/${projectId}${
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
          {t('cloud:custom_protocol.thing.thing')}
        </p>
      </NavLink>
      <NavLink
        to={`${PATHS.TEMPLATE_FLOW}/${projectId}${
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
          {t('cloud:custom_protocol.thing.template')}
        </p>
      </NavLink>
      <NavLink
        to={`${PATHS.SHAPE_FLOW}/${projectId}${
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
          {t('cloud:custom_protocol.thing.shape')}
        </p>
      </NavLink>
    </div>
  )
}

export default FlowEngineV2Navbar
