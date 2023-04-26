import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useGetDeviceById } from '../../api/deviceAPI/getDeviceById'
import { Link } from '~/components/Link'
import { PATHS } from '~/routes/PATHS'
import { useProjectIdStore } from '~/stores/project'

export function DeviceBreadcrumbs() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)

  const params = useParams()
  const deviceId = params.deviceId as string
  const { data: deviceData } = useGetDeviceById({ deviceId })

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            className="inline-flex items-center text-sm font-medium text-secondary-500 hover:text-white"
            to={`${PATHS.DEVICE_MANAGE}/${projectId}/${params.orgId}`}
          >
            {t('cloud.org_manage.org_manage.attr_list')}
          </Link>
        </li>
        <svg
          aria-hidden="true"
          className="h-6 w-6 text-secondary-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <li className="inline-flex items-center">
          <p className="inline-flex items-center text-sm font-medium text-secondary-500 hover:text-white ">
            {deviceData?.name}
          </p>
        </li>
      </ol>
    </nav>
  )
}
