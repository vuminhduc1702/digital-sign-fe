import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { useOrgIdStore } from '~/stores/org'
import { useProjectIdStore } from '~/stores/project'
import { useOrganizations } from '~/layout/MainLayout/api/getOrgs'
import { useOrgById } from '../api/getOrgById'
import { ComboBoxAttrTable } from '~/components/ComboBox'
import AttrTable from '~/components/Table/AttrTable'

import { type OrgAttr } from '~/layout/MainLayout/types'

import defaultOrgImage from '~/assets/images/default-org.png'
import { SearchIcon } from '~/components/SVGIcons'
import { Button } from '~/components/Button'

function OrgInfo() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)
  const { data: orgData } = useOrganizations({ projectId })
  const orgId =
    useOrgIdStore(state => state.orgId) || orgData?.organizations[0]?.id
  const { data: orgByIdData, refetch } = useOrgById({ orgId })

  useEffect(() => {
    if (orgId) {
      refetch()
    }
  }, [orgId])

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgAttr['attributes'][]
  >([])

  return (
    <div className="flex grow flex-col">
      <div>
        <h2 className="flex h-9 items-center bg-primary-400 pl-11 text-h2 uppercase text-white">
          {t('cloud.org_manage.org_info.overview.title')}
        </h2>
        <div className="my-3 flex gap-6 pl-11">
          <div className="flex flex-none items-center">
            <img
              src={orgByIdData?.image || defaultOrgImage}
              onError={e => {
                const target = e.target as HTMLImageElement
                target.onerror = null
                target.src = defaultOrgImage
              }}
              alt="Organization"
              className="h-36 w-32"
            />
          </div>
          <div className="flex flex-col gap-4">
            <p>{t('cloud.org_manage.org_info.overview.name')}</p>
            <p>{t('cloud.org_manage.org_info.overview.desc')}</p>
          </div>
          <div className="flex flex-col gap-4">
            <p>{orgByIdData?.name}</p>
            <p>{orgByIdData?.description}</p>
          </div>
        </div>
      </div>
      <div className="flex grow flex-col">
        <h2 className="mb-3 flex h-9 items-center bg-primary-400 pl-11 text-h2 uppercase text-white">
          {t('cloud.org_manage.org_info.attr_list')}
        </h2>
        <div className="flex justify-between">
          <div className="flex items-center gap-x-1">
            <Button
              className="rounded border-none"
              size="sm"
              variant="secondary"
            >
              {t('table.excel')}
            </Button>
            <Button
              className="rounded border-none"
              size="sm"
              variant="secondary"
            >
              {t('table.pdf')}
            </Button>
            <Button
              className="rounded border-none"
              size="sm"
              variant="secondary"
            >
              {t('table.print')}
            </Button>
          </div>
          <div className="flex gap-x-3">
            <ComboBoxAttrTable
              setFilteredComboboxData={setFilteredComboboxData}
              startIcon={
                <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
              }
            />
          </div>
        </div>
        <AttrTable data={filteredComboboxData} />
      </div>
    </div>
  )
}

export default OrgInfo
