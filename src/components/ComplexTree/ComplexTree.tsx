import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionMode, StaticTreeDataProvider, Tree, TreeItem, TreeItemIndex, TreeRef, UncontrolledTreeEnvironment } from "react-complex-tree"
import 'react-complex-tree/lib/style-modern.css'
import { type Org } from "~/layout/MainLayout/types";

type ComplexTreeProps = {
  items: Org[],
  selectOrg: (item: Org) => void,
  currentValue: string
}
const ComplexTree = ({
  items,
  selectOrg,
  currentValue
}: ComplexTreeProps) => {
  const [selectedItems, setSelectedItems] = useState<Array<TreeItemIndex>>([])
  const [expandedItems, setExpandedItems] = useState<Array<TreeItemIndex>>([])
  const [dataItem, setDataItem] = useState<Record<any, TreeItem>>({})
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
          data: { detailData: 'Root item', name: 'Root item' },
        }
      }
      treeData = {...treeData, ...rootItem}
      data.forEach((item: Org) => {
        treeData = {...treeData, ...parseOrg(item)}
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
          children: childrenArr
        },
      }
      treeData = {...treeData, ...treeItemNested}
    } else {
      const treeItem = {
        [data.id]: {
          index: data.id,
          data: { detailData: data.id, name: data.name },
          parent: data.org_id,
          isFolder: false,
        }
      }
      treeData = {...treeData, ...treeItem}
    }
    return treeData
  }

  const dataProvider = useMemo(
    () =>
      new StaticTreeDataProvider(dataItem, (item, data) => ({
        ...item,
        data,
      })),
    []
  );

  const findItemPath = useCallback(
    async (search, searchRoot = 'root') => {
      const item = await dataProvider.getTreeItem(searchRoot);
      if (item.data.toLowerCase().includes(search.toLowerCase())) {
        return [item.index];
      }
      const searchedItems = await Promise.all(
        item.children && item.children.map(child => findItemPath(search, child)) || []
      );
      const result = searchedItems.find(item => item !== null);
      if (!result) {
        return null;
      }
      return [item.index, ...result];
    },
    [dataProvider]
  )

  const find = useCallback(
    e => {
      e.preventDefault();
      if (search) {
        findItemPath(search).then(path => {
          if (path) {
            tree.current
              .expandSubsequently(path.slice(0, path.length - 1))
              .then(() => {
                tree.current.selectItems([path[path.length - 1]]);
                tree.current.focusItem(path[path.length - 1]);
              });
          }
        });
      }
    },
    [findItemPath, search]
  );

  let parentArr: TreeItemIndex[] = []

  function getParent(item: TreeItemIndex) {
    if (item && dataItem[item]) {
      const newItem = dataItem[dataItem[item].data.detailData].parent
      parentArr = parentArr.concat(dataItem[item].parent)
      if (newItem && newItem !== '') {
        getParent(newItem)
      }
    }
    return parentArr
  }

  useEffect(() => {
    if (currentValue) {
      const expanded = getParent(currentValue)
      tree.current?.expandItem(currentValue)
      setExpandedItems(expanded)
    }
  }, [dataItem, currentValue])


  useEffect(() => {
    parseData(items)
  }, [items])

  useEffect(() => {
    console.log(expandedItems)
  }, [expandedItems])

  return (
    <>
      {/* <form onSubmit={find}>
        <div className="flex">
          <InputField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
          />
        </div>
      </form> */}
      <UncontrolledTreeEnvironment
        viewState={{
          'complex-tree': {
            focusedItem: currentValue ? currentValue : selectedItems?.toString(),
            selectedItems: currentValue ? [currentValue.toString()] : [selectedItems.toString()],
            expandedItems: expandedItems,
          }
        }}
        getItemTitle={item => item.data.name}
        dataProvider={new StaticTreeDataProvider(dataItem, (item, data) => ({ ...item, data }))}
        onSelectItems={(items: any) => {
          setSelectedItems(items)
          selectOrg(items)
        }}
        defaultInteractionMode={InteractionMode.DoubleClickItemToExpand}
        canSearchByStartingTyping={true}
      >
        <Tree treeId={'complex-tree'} rootItem={'root'} ref={tree}></Tree>
      </UncontrolledTreeEnvironment>
    </>
  )
}

// new StaticTreeDataProvider(dataItem, (item, data) => ({ ...item, data }))

export { ComplexTree }