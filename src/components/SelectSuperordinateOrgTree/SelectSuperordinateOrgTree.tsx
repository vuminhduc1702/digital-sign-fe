import 'react-checkbox-tree/lib/react-checkbox-tree.css'
import { type Ref, useEffect, useState, useRef } from 'react'
import { type TreeEnvironmentRef } from 'react-complex-tree'
import { type Org } from '@/layout/MainLayout/types'
import { FieldWrapper, type FieldWrapperPassThroughProps } from '../Form'
import { useTranslation } from 'react-i18next'
import {
  Controller,
  type FieldValues,
  type UseFormRegisterReturn,
} from 'react-hook-form'
import { cn, flattenOrgs } from '@/utils/misc'
import { type ControllerPassThroughProps } from '@/types'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'
import { Button } from '../Button'
import storage from '@/utils/storage'
import { useGetOrgs } from '@/layout/MainLayout/api'
import { useParams } from 'react-router-dom'
import CheckboxTree, {
  type OnCheckNode,
  type Node,
  type OnExpandNode,
} from 'react-checkbox-tree'
import {
  IconCheckbox,
  IconTreeBranchCollapsed,
  IconTreeBranchExpanded,
} from '../SVGIcons'
import btnRemove from '@/assets/icons/btn-remove.svg'

type SelectSuperordinateOrgTreeProps<TFormValues extends FieldValues> = {
  options?: Org[]
  className?: string
  registration?: Partial<UseFormRegisterReturn>
  classnamefieldwrapper?: string
  classlabel?: string
  classchild?: string
  placeholder?: string
  refTree?: Ref<TreeEnvironmentRef<any>>
  selectedOrg?: string
  selectedOrgName?: string
  noSelectionOption?: boolean
  onlyLeafCheckbox?: boolean
  customOnChange?: (e?: any) => void
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues>

export function SelectSuperordinateOrgTree<TFormValues extends FieldValues>({
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
  selectedOrg,
  noSelectionOption = false,
  selectedOrgName,
  onlyLeafCheckbox = false,
  customOnChange,
  ...props
}: SelectSuperordinateOrgTreeProps<TFormValues>) {
  const { t } = useTranslation()
  const params = useParams()
  const tree = useRef()
  const projectId = storage.getProject()?.id ?? params.projectId

  const [nodes, setNodes] = useState<Node[]>([])
  const [checked, setChecked] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>()
  const [selectedNodes, setSelectedNodes] = useState<OnCheckNode>()
  const [expandedNodes, setExpandedNodes] = useState<OnExpandNode>()
  const [filterText, setFilterText] = useState<string>('')
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([])

  const { data: orgData } = useGetOrgs({ projectId })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])

  function parseDataToTree(data: any[]) {
    if (data) {
      const result = parseChildrenNode(data)
      if (result) {
        if (noSelectionOption) {
          result.unshift({
            id: '',
            label: t('tree:no_selection_org'),
            value: '',
            level: 1,
            parent_id: '',
            parent_name: '',
            showCheckbox: false,
            disabled: false,
          })
        }
        setNodes(result)
      }
    }
  }

  function parseChildrenNode(data: any[]) {
    if (data) {
      const result: any[] = data.map((item: any) => {
        return {
          id: item.id,
          label: item.name,
          value: item.id,
          level: item.level,
          parent_id: item.org_id,
          parent_name: item.parent_name,
          children: item.sub_orgs ? parseChildrenNode(item.sub_orgs) : null,
          showCheckbox: false,
        }
      })
      return result
    }
  }

  // Filter tree
  function expandNodesToLevel(
    nodes: Node[],
    targetLevel: number,
    currentLevel = 0,
  ) {
    if (currentLevel > targetLevel) {
      return []
    }

    let expanded: string[] = []
    nodes.forEach((node: Node) => {
      if (node.children && node.children.length > 0) {
        expanded = [
          ...expanded,
          node.value,
          ...expandNodesToLevel(node.children, targetLevel, currentLevel + 1),
        ]
      }
    })
    return expanded
  }

  function filterTree() {
    // Reset nodes back to unfiltered state
    if (!filterText) {
      setFilteredNodes(nodes)
      return
    }

    setFilteredNodes(nodes.reduce(filterNodes, []))
  }

  // Parse các org có dấu để tìm kiếm tương đối
  function removeDiacritics(str: string): string {
    return str
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/Đ/g, 'D')
      .replace(/đ/g, 'd')
  }

  // Tìm kiếm org tương đối
  function findRelativeString(
    target: string,
    strings: string[],
  ): string | undefined {
    const targetWithoutDiacritics = removeDiacritics(target).toLowerCase()
    if (
      removeDiacritics(String(strings))
        .toLowerCase()
        .includes(targetWithoutDiacritics)
    ) {
      return String(strings)
    }
    return undefined
  }

  function filterNodes(filtered: any, node: any) {
    const children = (node.children || []).reduce(filterNodes, [])

    const parsedFilterText = findRelativeString(
      filterText.toLocaleLowerCase(),
      node.label.toLocaleLowerCase(),
    )

    if (
      // Node's label matches the search string
      (parsedFilterText &&
        node.label
          .toLocaleLowerCase()
          .indexOf(parsedFilterText.toLocaleLowerCase()) > -1) ||
      // Or a children has a matching node
      children.length
    ) {
      filtered.push({ ...node, children })
      setExpanded(expandNodesToLevel(filteredNodes, node.level))
    }

    return filtered
  }

  function onFilterChange(e) {
    setFilterText(e.target.value)
    filterTree()
  }

  function clearFilterNodes() {
    setExpanded([])
    setFilterText('')
    setFilteredNodes(nodes)
  }

  useEffect(() => {
    if (orgData) {
      parseDataToTree(orgData.organizations)
    }
  }, [orgData, checked])

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      setFilteredNodes(nodes)
    }
  }, [nodes])

  useEffect(() => {
    if (!filterText || filterText === '' || filterText.length === 0) {
      clearFilterNodes()
    }
  }, [filterText])

  useEffect(() => {
    customOnChange && customOnChange(checked)
  }, [checked])

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
                  {value
                    ? orgDataFlatten.find((item: Org) => item.id === value)
                        ?.name
                    : value === ''
                      ? t('tree:no_selection_org')
                      : t('placeholder:select_org')}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="popover-content w-auto p-2"
                align="start"
              >
                <div className="mb-2 flex">
                  <input
                    className="w-full rounded-md border border-secondary-600 p-1.5"
                    placeholder="Search..."
                    type="text"
                    value={filterText}
                    onChange={onFilterChange}
                  />
                  <img
                    src={btnRemove}
                    className={cn(
                      'absolute right-[24px] top-[18px] cursor-pointer',
                      {
                        hidden: filterText.length === 0,
                      },
                    )}
                    onClick={clearFilterNodes}
                    alt="remove"
                  />
                </div>
                <div className=" max-h-[300px] overflow-x-auto">
                  <CheckboxTree
                    ref={tree}
                    nodes={filteredNodes}
                    checked={checked}
                    expanded={expanded}
                    onCheck={(checkedItem: string[], node) => {
                      onChange(node?.value)
                      setChecked([node?.value])
                    }}
                    checkModel="all"
                    onExpand={(expanded, node) => {
                      setExpanded(expanded)
                      setExpandedNodes(node)
                    }}
                    onClick={node => {
                      setSelectedNodes(node)
                      if (onlyLeafCheckbox && node.treeDepth !== 2) {
                        return
                      } else {
                        onChange(node?.value)
                        setChecked([node?.value])
                      }
                    }}
                    icons={{
                      check: <IconCheckbox isCheck={true} />,
                      uncheck: <IconCheckbox />,
                      halfCheck: <IconCheckbox checked="indeterminate" />,
                      expandClose: (
                        <IconTreeBranchCollapsed className="h-[14px] w-[14px]" />
                      ),
                      expandOpen: (
                        <IconTreeBranchExpanded className="h-[14px] w-[14px]" />
                      ),
                      parentClose: null,
                      parentOpen: null,
                      leaf: null,
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          )
        }}
      />
    </FieldWrapper>
  )
}
