import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ControlledTreeEnvironment, InteractionMode, StaticTreeDataProvider, Tree, TreeEnvironmentRef, TreeItem, TreeItemIndex, TreeRef, UncontrolledTreeEnvironment } from "react-complex-tree"
import 'react-complex-tree/lib/style-modern.css'
import { type Org } from "~/layout/MainLayout/types";
import { InputField } from "../Form";
import { SearchIcon } from "../SVGIcons";
import btnRemoveIcon from '~/assets/icons/btn-remove.svg'

type TreeItemChildren = {
  [key: string]: {
    index: string,
    data: { detailData: string, name: string },
    parent: string,
    isFolder: boolean,
    children?: string[]
  },
}
type ComplexTreeProps = {
  items?: Org[],
  selectOrg: (item: Org) => void,
  currentValue: string
}
const ComplexTree = ({
  items,
  selectOrg,
  currentValue
}: ComplexTreeProps) => {
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>();
  const [selectedItems, setSelectedItems] = useState<Array<TreeItemIndex>>([])
  const [expandedItems, setExpandedItems] = useState<Array<TreeItemIndex>>([])
  const [dataItem, setDataItem] = useState<Record<TreeItemIndex, TreeItem<any>>>({})
  let treeData = {}

  const [search, setSearch] = useState('');
  const tree = useRef<TreeRef<any>>(null)

  function parseData(data: Org[]) {
    if (data) {
      const rootItem = {
        root: {
          index: 'root',
          isFolder: true,
          children: data.map((item: Org) => item.id),
          data: { detailData: 'root', name: 'root' },
        }
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
  
  const dataProvider = new StaticTreeDataProvider(dataItem, (item, data) => ({...item,data,}))
  
  const findItemPath = useCallback(
    async (search: string, searchRoot: TreeItemIndex | string = 'root'): Promise<any> => {
      const item = await dataProvider.getTreeItem(searchRoot)
      if (item.data.name.toLowerCase().includes(search.toLowerCase())) {
        return [item.index];
      }
      const searchedItems = await Promise.all(
        (item.children &&
          item.children.map(child => findItemPath(search, child))) ||
          [],
      )
      const result = searchedItems.find(item => item !== null)
      if (!result) {
        return null
      }
      return [item.index, ...result]
    },
    [dataItem]
  );

  const find = useCallback(
    (e: any) => {
      e.preventDefault();
      if (search) {
        findItemPath(search).then((path: TreeItemIndex[]) => {
          if (path && tree.current) {
            tree.current
              .expandSubsequently(path.slice(0, path.length - 1))
              .then(() => {
                tree.current?.selectItems([path[path.length - 1]]);
                tree.current?.focusItem(path[path.length - 1]);
              });
          }
        })
      }
    },
    [findItemPath, search]
  )

  let parentArr: TreeItemIndex[] = []

  function getParent(item: TreeItemIndex) {
    if (item && dataItem[item]) {
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
    if (currentValue) {
      const expanded = getParent(currentValue)
      setExpandedItems([...expandedItems, ...expanded])
    }
  }, [dataItem, currentValue])

  useEffect(() => {
    if (items) {
      parseData(items)
    }
  }, [items])

  return (
    <>
      <div className="flex">
        <InputField
          className="flex"
          type="text" 
          value={search}
          onChange={e => {
            setSearch(e.target.value)
          }}
          placeholder="Search..."
        />
        <div onClick={find} className="items-center flex cursor-pointer" style={{width: '36px', height: '36px', padding: '10px'}}>
          <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
        </div>
      </div>
      <ControlledTreeEnvironment
        viewState={{
          'complex-tree': {
            focusedItem: focusedItem,
            selectedItems: currentValue
              ? [currentValue.toString()]
              : [selectedItems.toString()],
            expandedItems,
          },
        }}
        getItemTitle={item => item.data.name}
        items={dataItem}
        onFocusItem={item => setFocusedItem(item.index)}
        onExpandItem={item => setExpandedItems([...expandedItems, item.index])}
        onCollapseItem={item =>
          setExpandedItems(
            expandedItems.filter(
              expandedItemIndex => expandedItemIndex !== item.index,
            ),
          )
        }
        onSelectItems={(items: any) => {
          setSelectedItems(items)
          selectOrg(items)
        }}
        defaultInteractionMode={InteractionMode.DoubleClickItemToExpand}
        canSearchByStartingTyping={true}
      >
        <Tree treeId={'complex-tree'} rootItem={'root'} ref={tree}></Tree>
      </ControlledTreeEnvironment>
    </>
  )
}

// new StaticTreeDataProvider(dataItem, (item, data) => ({ ...item, data }))

export { ComplexTree }
