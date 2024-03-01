import { type Ref, useCallback, useEffect, useRef, useState } from 'react'
import {
  ControlledTreeEnvironment,
  InteractionMode,
  StaticTreeDataProvider,
  Tree,
  type TreeEnvironmentRef,
  type TreeItem,
  type TreeItemIndex,
  type TreeRef,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'
import { type Org } from '~/layout/MainLayout/types'
import {
  FieldWrapper,
  type FieldWrapperPassThroughProps,
  InputField,
} from '../Form'
import { SearchIcon } from '../SVGIcons'
import { useTranslation } from 'react-i18next'
import {
  Controller,
  type FieldValues,
  type UseFormRegisterReturn,
} from 'react-hook-form'
import { cn } from '~/utils/misc'
import { type ControllerPassThroughProps } from '~/types'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'
import { Button } from '../Button'

type ComplexTreeProps<TFormValues extends FieldValues> = {
  options?: Org[]
  className?: string
  registration?: Partial<UseFormRegisterReturn>
  classnamefieldwrapper?: string
  classlabel?: string
  classchild?: string
  placeholder?: string
  refTree?: Ref<TreeEnvironmentRef<any>>
  customOnChange?: (e?: any) => void
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues>

export function ComplexTree<TFormValues extends FieldValues>({
  name,
  label,
  control,
  options,
  error,
  className,
  placeholder,
  classnamefieldwrapper,
  classlabel,
  classchild,
  customOnChange,
  ...props
}: ComplexTreeProps<TFormValues>) {
  const { t } = useTranslation()
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>()
  const [selectedItems, setSelectedItems] = useState<Array<TreeItemIndex>>([])
  const [expandedItems, setExpandedItems] = useState<Array<TreeItemIndex>>([])
  const [dataItem, setDataItem] = useState<
    Record<TreeItemIndex, TreeItem<any>>
  >({})
  const [findOrgMsg, setFindOrgMsg] = useState('')
  let treeData = {}

  const [search, setSearch] = useState('')
  const tree = useRef<TreeRef<any>>(null)
  const no_org = t('cloud:org_manage.org_manage.add_org.no_org')

  function parseData(data: Org[]) {
    if (data) {
      const rootItem = {
        root: {
          index: 'root',
          isFolder: true,
          children: data
            .map((item: Org) => item.id)
            .concat(no_org)
            .toReversed(),
          data: { detailData: 'root', name: 'root' },
        },
        [no_org]: {
          index: no_org,
          isFolder: false,
          parent: '',
          data: { detailData: no_org, name: no_org },
        },
      }
      treeData = { ...treeData, ...rootItem }
      data.forEach((item: Org) => {
        treeData = { ...treeData, ...parseOrg(item) }
      })
      setDataItem(treeData)
    }
  }

  function parseOrg(data: Org) {
    let childrenArr: string[] = []
    if (data.sub_orgs) {
      data.sub_orgs.forEach((item: Org) => {
        childrenArr.push(item.id)
        parseOrg(item)
      })
      const treeItemNested = {
        [data.id]: {
          index: data.id,
          data: { detailData: data.id, name: data.name },
          parent: data.org_id,
          isFolder: true,
          children: childrenArr,
        },
      }
      treeData = { ...treeData, ...treeItemNested }
    } else {
      const treeItem = {
        [data.id]: {
          index: data.id,
          data: { detailData: data.id, name: data.name },
          parent: data.org_id,
          isFolder: false,
        },
      }
      treeData = { ...treeData, ...treeItem }
    }
    return treeData
  }

  const dataProvider = new StaticTreeDataProvider(dataItem, (item, data) => ({
    ...item,
    data,
  }))

  const findItemPath = useCallback(
    async (
      search: string,
      searchRoot: TreeItemIndex | string = 'root',
    ): Promise<any> => {
      const item = await dataProvider.getTreeItem(searchRoot)
      if (item.data.name.toLowerCase().includes(search.toLowerCase())) {
        return [item.index]
      }
      const searchedItems = await Promise.all(
        (item.children &&
          item.children.map(child => findItemPath(search, child))) ||
          [],
      )
      const result = searchedItems.find(item => item !== null)
      if (!result) {
        setFindOrgMsg(t('cloud:org_manage.org_manage.table.org_not_found'))
        return null
      } else {
        setFindOrgMsg('')
      }
      return [item.index, ...result]
    },
    [dataItem],
  )

  const find = useCallback(
    (e: any) => {
      e.preventDefault()
      if (search) {
        findItemPath(search).then((path: TreeItemIndex[]) => {
          if (path && tree.current) {
            tree.current
              .expandSubsequently(path.slice(0, path.length - 1))
              .then(() => {
                tree.current?.selectItems([path[path.length - 1]])
                tree.current?.focusItem(path[path.length - 1])
              })
          }
        })
      }
    },
    [findItemPath, search],
  )

  let parentArr: TreeItemIndex[] = []

  function getParent(item: TreeItemIndex | TreeItemIndex[]) {
    if (item && dataItem[item] && dataItem[item].parent) {
      const newItem = dataItem[dataItem[item].data.detailData].parent
      parentArr = parentArr.concat(dataItem[item].parent)
      if (newItem && newItem !== '') {
        getParent(newItem)
      } else {
        return parentArr
      }
    }
    return parentArr
  }

  useEffect(() => {
    if (selectedItems) {
      const expanded = getParent(selectedItems)
      setExpandedItems([...expandedItems, ...expanded])
    }
  }, [dataItem, selectedItems])

  useEffect(() => {
    if (options) {
      parseData(options)
    }
  }, [options])

  return (
    <FieldWrapper
      classlabel={classlabel}
      classchild={classchild}
      className={cn('', classnamefieldwrapper)}
      label={label}
    >
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...field } }) => {
          const parseValue =
            value && dataItem[value] ? dataItem[value].data.name : ''
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="org_id"
                  variant="trans"
                  size="square"
                  className={cn(
                    'relative w-full !justify-between rounded-md px-3 text-left font-normal focus:outline-2 focus:outline-offset-0 focus:outline-focus-400 focus:ring-focus-400',
                    !value && 'text-secondary-700',
                  )}
                >
                  {value ? (
                    <span>{parseValue ? parseValue : value}</span>
                  ) : (
                    <span>
                      {t('cloud:org_manage.org_manage.add_org.choose_org')}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="popover-content w-auto p-2"
                align="start"
              >
                <div className="flex">
                  <InputField
                    className="flex"
                    type="text"
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value)
                      setFindOrgMsg('')
                    }}
                  />
                  <div
                    onClick={find}
                    className="flex size-[36px] cursor-pointer items-center rounded-md border border-gray-400 p-[10px]"
                  >
                    <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
                  </div>
                </div>
                <div className="mt-1 text-primary-400">{findOrgMsg}</div>
                <ControlledTreeEnvironment
                  {...field}
                  viewState={{
                    'complex-tree': {
                      focusedItem: focusedItem,
                      selectedItems: value
                        ? [value.toString()]
                        : [selectedItems.toString()],
                      expandedItems,
                    },
                  }}
                  getItemTitle={item => item.data.name}
                  items={dataItem}
                  onFocusItem={item => setFocusedItem(item.index)}
                  onExpandItem={item =>
                    setExpandedItems([...expandedItems, item.index])
                  }
                  onCollapseItem={item =>
                    setExpandedItems(
                      expandedItems.filter(
                        expandedItemIndex => expandedItemIndex !== item.index,
                      ),
                    )
                  }
                  onSelectItems={(items: any) => {
                    setSelectedItems(items)
                    onChange(items.toString())
                    customOnChange?.(items)
                  }}
                  defaultInteractionMode={
                    InteractionMode.DoubleClickItemToExpand
                  }
                  canSearchByStartingTyping={true}
                  {...props}
                >
                  <Tree
                    treeId={'complex-tree'}
                    rootItem={'root'}
                    ref={tree}
                  ></Tree>
                </ControlledTreeEnvironment>
              </PopoverContent>
            </Popover>
          )
        }}
      />
    </FieldWrapper>
  )
}
