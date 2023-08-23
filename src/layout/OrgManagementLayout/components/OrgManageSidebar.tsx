import clsx from 'clsx'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useProjectById } from '~/cloud/project/api'
import { Button } from '~/components/Button'
import { ComboBoxSelectOrg } from '~/layout/MainLayout/components'
import { PATHS } from '~/routes/PATHS'
import { useDisclosure } from '~/utils/hooks'
import storage from '~/utils/storage'
import { CreateOrg } from './CreateOrg'
import { UpdateOrg } from './UpdateOrg'

import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import listIcon from '~/assets/icons/list.svg'
import { SearchIcon } from '~/components/SVGIcons'
import TreeView from './Tree'

export type OrgMapType = {
  id: string
  name: string
  level: string
  description: string
  parent_name: string
  org_id: string
  children: any[]
}

export type EntityTypeURL = 'org' | 'group' | 'user' | 'device' | 'event' | 'role'

function OrgManageSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()

  const { orgId } = useParams()

  const { id: projectId } = storage.getProject()

  const { data: projectByIdData } = useProjectById({
    projectId,
    config: { enabled: !!projectId },
  })

  const [selectedUpdateOrg, setSelectedUpdateOrg] = useState<OrgMapType>({
    id: '',
    name: '',
    level: '1',
    description: '',
    parent_name: '',
    org_id: '',
    children: []
  })
  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])

  const [selected, setSelected] = useState<any>({})
  const [query, setQuery] = useState('')

  const getInt = (x: string) => Number.parseInt(x);
  const convertData = (data: OrgMapType[]) => {
    if (selected?.id) {
      const findIndex = filteredComboboxData.findIndex(item => item.id === selected?.id);
      let arr = [];
      let currentLevel = selected?.level
      for (let i = findIndex; i >= 0; i--) {
        if (i === findIndex) {
          arr.push(filteredComboboxData[i]);
        } else {
          if (getInt(filteredComboboxData[i].level) < getInt(currentLevel)) {
            arr.splice(0, 0, filteredComboboxData[i]);
            if (filteredComboboxData[i].level === '1') {
              break;
            }
            currentLevel = filteredComboboxData[i].level;
          }
        }
      }
      data = arr
    }

    data.forEach((node) => {
      node.children = [];
    });

    data.forEach((node) => {
      const level = parseInt(node.level);
      if (level > 1) {
        const parentLevel = level - 1;
        const parentNodes = data.filter(
          (parent) =>
            parseInt(parent.level) === parentLevel && parent.id === node.org_id
        );
        parentNodes.forEach((parent) => {
          parent.children.push(node);
        });
      }
    });

    const tree = data.filter((node) => parseInt(node.level) === 1);
    return tree;
  };

  const entityTypeURL = window.location.pathname.split('/')[3] as EntityTypeURL
  const orgIdURL = window.location.pathname.split('/')[5]

  const handleEdit = (data: OrgMapType) => {
    open()
    setSelectedUpdateOrg(data)
  }

  const filteredPeople =
    query === ''
      ? filteredComboboxData
      : filteredComboboxData.filter((person) =>
        person.name
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, ''))
      )

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

        <CreateOrg />
        <div className='hidden'><ComboBoxSelectOrg setFilteredComboboxData={setFilteredComboboxData} /></div>
        <Combobox value={selected} onChange={setSelected}>
          <div className="relative w-full">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-body-sm">
              <Combobox.Input
                className={`block w-full appearance-none rounded-lg border border-secondary-600 px-3 py-2 placeholder-secondary-700 shadow-sm focus:border-secondary-900 focus:outline-none focus:ring-secondary-900 sm:text-body-sm pl-8`}
                displayValue={(person: any) => person.name}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Combobox.Button className="absolute inset-y-0 left-0 flex cursor-pointer items-center pl-2">
                <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
              </Combobox.Button>
              <XMarkIcon
                className="absolute right-0 top-1/2 mr-1 h-5 w-5 -translate-y-1/2 transform cursor-pointer opacity-50"
                onClick={() => setSelected('')}
              />
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery('')}
            >
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-body-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {filteredPeople.length === 0 && query !== '' ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-secondary-700">
                    {t('error:not_found')}
                  </div>
                ) : (
                  filteredPeople.map((person) => (
                    <Combobox.Option
                      key={person.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-primary-300 text-white' : 'text-black'
                        }`
                      }
                      value={person}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                              }`}
                          >
                            {person.name}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'
                                }`}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>
      <div className="grow overflow-y-auto bg-secondary-500 p-3">
        <div className="space-y-3">
          <Button
            className={clsx('rounded-md border-none', {
              'text-primary-400': orgIdURL == null,
            })}
            variant="muted"
            onClick={() => {
              if (projectByIdData == null) {
                return navigate(PATHS.PROJECT_MANAGE)
              }
              switch (entityTypeURL) {
                case 'org':
                  return navigate(`${PATHS.ORG_MANAGE}/${projectId}`)
                case 'event':
                  return navigate(`${PATHS.EVENT_MANAGE}/${projectId}`)
                case 'group':
                  return navigate(`${PATHS.GROUP_MANAGE}/${projectId}`)
                case 'user':
                  return navigate(`${PATHS.USER_MANAGE}/${projectId}`)
                case 'device':
                  return navigate(`${PATHS.DEVICE_MANAGE}/${projectId}`)
                default:
                  return navigate(`${PATHS.ORG_MANAGE}/${projectId}`)
              }
            }}
          >
            {projectByIdData?.name ||
              t('cloud:org_manage.org_manage.overview.choose_project')}
          </Button>
        </div>
        <UpdateOrg
          close={close}
          isOpen={isOpen}
          selectedUpdateOrg={selectedUpdateOrg}
        />
        <TreeView data={convertData(filteredComboboxData)} handleEditTreeView={(data: OrgMapType) => handleEdit(data)} />
      </div>
    </>
  )
}

export default OrgManageSidebar
