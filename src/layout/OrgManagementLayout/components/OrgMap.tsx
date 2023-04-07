import clsx from 'clsx'

import { useOrgIdStore } from '~/stores/org'
import { useProjectIdStore } from '~/stores/project'

import { Org } from '~/layout/MainLayout/types'
import { useOrganizations } from '~/layout/MainLayout/api/getOrgs'
import { Button } from '~/components/Button'
import { flattenData } from '~/utils/misc'

import { BtnContextMenuIcon } from '~/components/SVGIcons'

type OrgMap = {
  id: string
  name: string
  level: string
}

function OrgMap() {
  const projectName = useProjectIdStore(state => state.projectName)
  const projectId = useProjectIdStore(state => state.projectId)
  const { data: orgData } = useOrganizations({ projectId })
  const setOrgId = useOrgIdStore(state => state.setOrgId)
  console.log('orgData', orgData)

  const { acc: orgFlattenData } = flattenData(
    orgData?.organizations as Array<Org>,
    ['id', 'name', 'level'],
    'sub_orgs',
  )

  return (
    <div className="grow bg-secondary-500 p-3 pl-12">
      <div className="space-y-3">
        <Button className="rounded-md border-none" variant="muted">
          {projectName}
        </Button>
        {orgFlattenData?.map((org: OrgMap) => (
          <Button
            className={clsx(
              'flex h-10 cursor-pointer flex-col gap-y-3 rounded-md border-none pl-4',
              {
                'ml-8': org.level === '1',
                'ml-16': org.level === '2',
                'ml-24': org.level === '3',
                'ml-32': org.level === '4',
                'ml-40': org.level === '5',
              },
            )}
            key={org.id}
            variant="muted"
            size="no-p"
            onClick={() => setOrgId(org.id)}
            endIcon={
              <div className="group grid h-10 w-6 place-content-center rounded-r-md bg-secondary-600">
                <BtnContextMenuIcon
                  className="cursor-pointer text-white group-hover:text-primary-400"
                  height={20}
                  width={3}
                  viewBox="0 0 3 20"
                />
              </div>
            }
          >
            <p className="my-auto">{org.name}</p>
          </Button>
        ))}
      </div>
    </div>
  )
}

export default OrgMap
