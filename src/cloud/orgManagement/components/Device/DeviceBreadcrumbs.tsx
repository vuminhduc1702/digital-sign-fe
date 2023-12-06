import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useDeviceById } from '../../api/deviceAPI'
import { Link } from '~/components/Link'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'

import { BreadcrumbIcon } from '~/components/SVGIcons'

export function DeviceBreadcrumbs() {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id

  const params = useParams()
  const deviceId = params.deviceId as string
  const { data: deviceData } = useDeviceById({ deviceId })

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            className="text-body-sm text-secondary-500 inline-flex items-center hover:text-white"
            to={`${PATHS.DEVICE_MANAGE}/${projectId}/${params.orgId}`}
          >
            {t('cloud:org_manage.org_manage.breadcrumb.device_list')}
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
          <p className="text-body-sm text-secondary-500 inline-flex items-center hover:text-white ">
            {deviceData?.name}
          </p>
        </li>
      </ol>
    </nav>
  )
}
