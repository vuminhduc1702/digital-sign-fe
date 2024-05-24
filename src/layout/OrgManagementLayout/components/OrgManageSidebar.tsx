import clsx from 'clsx'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useProjectById } from '@/cloud/project/api'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/routes/PATHS'
import { useDisclosure } from '@/utils/hooks'
import storage from '@/utils/storage'
import { CreateOrg } from './CreateOrg'
import { UpdateOrg } from './UpdateOrg'

import listIcon from '@/assets/icons/list.svg'
import { SearchField } from '@/components/Input'
import TreeView from './Tree'
import { useGetOrgs, useGetOrgsWoExpand } from '@/layout/MainLayout/api'
import { flattenData } from '@/utils/misc'
import { PlusIcon } from '@/components/SVGIcons'

export type OrgMapType = {
  id: string
  name: string
  level: string
  description: string
  parent_name: string
  org_id: string
  image: string
  children: OrgMapType[]
  isSearch?: boolean
  isShow?: boolean
}

export type EntityTypeURL =
  | 'org'
  | 'group'
  | 'user'
  | 'device'
  | 'event'
  | 'role'

function OrgManageSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()

  const [searchQuery, setSearchQuery] = useState('')
  const projectId = storage.getProject()?.id
  const { orgId } = useParams()
  const {
    close: closeCreateOrg,
    open: openCreateOrg,
    isOpen: isOpenCreateOrg,
  } = useDisclosure()
  const { data: projectByIdData } = useProjectById({
    projectId,
    config: { enabled: !!projectId },
  })
  const [selected, setSelected] = useState<any>({})
  const [selectedUpdateOrg, setSelectedUpdateOrg] = useState<OrgMapType>({
    id: '',
    name: '',
    level: '1',
    description: '',
    parent_name: '',
    org_id: '',
    image: '',
    children: [],
  })
  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])

  const { data: orgData } = useGetOrgs({
    projectId,
  })
  const { acc: orgFlattenData, extractedPropertyKeys } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name', 'org_id', 'image'],
    'sub_orgs',
  )
  useEffect(() => {
    setFilteredComboboxData?.(orgFlattenData)
  }, [orgData])

  // const { data: orgDataWoExpand } = useGetOrgsWoExpand({
  //   projectId,
  //   search_str: searchQuery,
  //   search_field: 'name',
  //   config: {
  //     enabled: !!orgFlattenData,
  //   },
  // })
  // useEffect(() => {
  //   const listId: string[] = []
  //   orgDataWoExpand?.organizations?.forEach(item => {
  //     listId.push(item.id)
  //   })
  //   setFilteredComboboxData?.(
  //     orgFlattenData.filter(item => listId.includes(item.id)),
  //   )
  // }, [orgDataWoExpand])

  const getInt = (x: string) => Number.parseInt(x)
  const convertData = (data: OrgMapType[]) => {
    const findIndexSearch = filteredComboboxData.findIndex(
      item => item.isSearch,
    )
    if (findIndexSearch !== -1) {
      filteredComboboxData[findIndexSearch].isSearch = false
    }
    if (selected?.id) {
      const findIndex = filteredComboboxData.findIndex(
        item => item.id === selected?.id,
      )
      filteredComboboxData[findIndex].isSearch = true
      let arr = []
      let currentLevel = selected?.level
      for (let i = findIndex; i >= 0; i--) {
        if (i === findIndex) {
          arr.push(filteredComboboxData[i])
        } else {
          if (getInt(filteredComboboxData[i].level) < getInt(currentLevel)) {
            arr.splice(0, 0, filteredComboboxData[i])
            if (filteredComboboxData[i].level === '1') {
              break
            }
            currentLevel = filteredComboboxData[i].level
          }
        }
      }
      data = arr
    }

    if (orgId) {
      const findIndex = filteredComboboxData.findIndex(
        item => item.id === orgId,
      )
      if (findIndex !== -1) {
        let currentLevel = data[findIndex]?.level
        for (let i = findIndex; i >= 0; i--) {
          if (i === findIndex) {
          } else {
            if (data[i]) {
              if (
                getInt(filteredComboboxData[i].level) < getInt(currentLevel)
              ) {
                data[i].isShow = true
                if (data[i].level === '1') {
                  break
                }
                // } else {
                //   data[i].isShow = false
              }
            }
          }
        }
      }
    } else {
      data.forEach(item => {
        if (item) {
          item.isShow = false
        }
      })
    }

    data.forEach(node => {
      node.children = []
    })

    data.forEach(node => {
      const level = parseInt(node.level)
      if (level > 1) {
        const parentLevel = level - 1
        const parentNodes = data.filter(
          parent =>
            parseInt(parent.level) === parentLevel && parent.id === node.org_id,
        )
        parentNodes.forEach(parent => {
          parent.children.push(node)
        })
      }
    })

    const tree = data.filter(node => parseInt(node.level) === 1)
    return tree
  }
  const entityTypeURL = window.location.pathname.split('/')[3] as EntityTypeURL
  const orgIdURL = window.location.pathname.split('/')[5]
  const handleEdit = (data: OrgMapType) => {
    open()
    setSelectedUpdateOrg(data)
  }

  return (
    <>
      <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
        <div className="flex gap-3">
          <img
            src={listIcon}
            alt="Organization list"
            className="aspect-square w-[20px]"
          />
          <p>{t('cloud:org_manage.org_list')}</p>
        </div>
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
          onClick={openCreateOrg}
        />
        <SearchField
          className="flex md:hidden 2xl:flex"
          setSearchValue={setSearchQuery}
          closeSearch={true}
        />
      </div>
      <div className="h-[82vh] grow overflow-y-auto bg-secondary-500 p-3">
        <div className="space-y-3">
          <Button
            className={clsx('rounded-md border-none', {
              'text-primary-400': orgIdURL === '' || orgIdURL === '%20',
            })}
            variant="muted"
            onClick={() => {
              if (projectByIdData == null) {
                return navigate(PATHS.PROJECT_MANAGE)
              }
              switch (entityTypeURL) {
                case 'org':
                  return navigate(`${PATHS.ORG_MANAGE}/${projectId}/`)
                case 'event':
                  return navigate(`${PATHS.EVENT_MANAGE}/${projectId}/`)
                case 'group':
                  return navigate(`${PATHS.GROUP_MANAGE}/${projectId}/`)
                case 'user':
                  return navigate(`${PATHS.USER_MANAGE}/${projectId}/`)
                case 'device':
                  return navigate(`${PATHS.DEVICE_MANAGE}/${projectId}/`)
                default:
                  return navigate(`${PATHS.ORG_MANAGE}/${projectId}/`)
              }
            }}
          >
            {projectByIdData?.name ||
              t('cloud:org_manage.org_manage.overview.choose_project')}
          </Button>
        </div>
        <CreateOrg
          close={closeCreateOrg}
          open={openCreateOrg}
          isOpen={isOpenCreateOrg}
        />
        <UpdateOrg
          close={close}
          isOpen={isOpen}
          selectedUpdateOrg={selectedUpdateOrg}
        />
        <TreeView
          data={convertData(filteredComboboxData)}
          handleEditTreeView={(data: OrgMapType) => handleEdit(data)}
          isShow={selected?.id ? true : false}
        />
      </div>
    </>
  )
}

export default OrgManageSidebar
