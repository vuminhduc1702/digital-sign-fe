import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Link } from '~/components/Link'
import { PATHS } from '~/routes/PATHS'
import { useProjectIdStore } from '~/stores/project'
import { useGroupById } from '../../api/groupAPI'

import { BreadcrumbIcon } from '~/components/SVGIcons'

export function GroupBreadcrumbs() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)

  const params = useParams()
  const groupId = params.groupId as string
  const { data: groupData } = useGroupById({ groupId })

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            className="inline-flex items-center text-body-sm text-secondary-500 hover:text-white"
            to={`${PATHS.GROUP_MANAGE}/${projectId}/${params.orgId}`}
          >
            {t('cloud:org_manage.org_manage.breadcrumb.group_list')}
          </Link>
        </li>
        <BreadcrumbIcon
          width={20}
          height={20}
          className="text-secondary-500"
          aria-hidden="true"
          viewBox="0 0 20 20"
        />
        <li className="inline-flex items-center">
          <p className="inline-flex items-center text-body-sm text-secondary-500 hover:text-white ">
            {groupData?.name}
          </p>
        </li>
      </ol>
    </nav>
  )
}
