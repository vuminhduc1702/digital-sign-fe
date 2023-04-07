import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { ComboBox } from '~/components/ComboBox'
import { useProjectIdStore } from '~/stores/project'
import { useOrganizations } from '~/layout/MainLayout/api/getOrgs'
import { flattenData } from '~/utils/misc'

import { PlusIcon, SearchIcon } from '~/components/SVGIcons'
import listIcon from '~/assets/icons/list.svg'

import { Org } from '~/layout/MainLayout/types'

function Search() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)
  const { data: orgData, isLoading: isLoadingOrg } = useOrganizations({
    projectId,
  })

  const { acc: orgFlattenData, extractedPropertyKeys } = flattenData(
    orgData?.organizations as Array<Org>,
    ['id', 'name'],
    'sub_orgs',
  )

  return (
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
        className="rounded-md"
        variant="trans"
        size="square"
        startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
      />
      {/* TODO: Handle loading state Loading... more beautiful */}
      {!isLoadingOrg ? (
        <ComboBox
          data={orgFlattenData}
          extractedPropertyKeys={extractedPropertyKeys}
          startIcon={<SearchIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default Search
