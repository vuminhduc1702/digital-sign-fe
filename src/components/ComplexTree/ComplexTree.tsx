import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionMode, StaticTreeDataProvider, Tree, TreeItem, TreeItemIndex, UncontrolledTreeEnvironment } from "react-complex-tree"
import 'react-complex-tree/lib/style-modern.css'
import { Org } from "~/layout/MainLayout/types";
import { Button } from "../Button";
import { SearchIcon } from "../SVGIcons";
import { InputField } from "../Form";

type ComplexTreeProps = {
  items: Org[],
  selectOrg: (item: any) => void,
  currentValue: string
}
const ComplexTree = ({
  items,
  selectOrg,
  currentValue
}: ComplexTreeProps) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState<Array<TreeItemIndex>>([])
  const [dataItem, setDataItem] = useState<Record<TreeItemIndex, TreeItem>>({})
  let treeData = {}
  const [parentArr, setParentArr] = useState([])

  const [search, setSearch] = useState('');
  const tree = useRef(null)

  function parseData(data: Org[]) {
    if (data) {
      const rootItem = {
        root: {
          index: 'root',
          isFolder: true,
          children: data.map((item: Org) => item.id),
          data: 'Root item',
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

  function getParent(item: any) {
    let parentArr = [item.parent]
    if (item && dataItem[item] && dataItem[item].parent) {
      const newItem = dataItem[dataItem[item].data.detailData].parent
      parentArr = parentArr.concat(dataItem[item].parent)
      if (newItem && newItem != '') {
        getParent(newItem)
      }
    } else if (!dataItem[item] || !dataItem[item].parent) {
      return parentArr
    }
    return parentArr
  }

  useEffect(() => {
    if (items) {
      parseData(items)
    }
  }, [items])

  useEffect(() => {
    if (currentValue) {
      console.log('current: ', getParent(currentValue))
      console.log(parentArr)
      // setParentArr([...parentArr, ...getParent(currentValue)])
      // console.log('parent: ', expanded)
      // setExpandedItems(expanded)
    }
  }, [currentValue])

  return (
    <>
      <form onSubmit={find}>
        <div className="flex">
          <InputField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
          />
          <Button
            className="rounded-md"
            variant="trans"
            size="square"
            startIcon={
              <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
            }
            type="submit"
          />
        </div>
      </form>
      <UncontrolledTreeEnvironment
        viewState={{
          'complex-tree': {
            focusedItem: currentValue ? currentValue : selectedItems?.toString(),
            expandedItems,
            selectedItems: [currentValue],
          }
        }}
        getItemTitle={item => item.data.name}
        dataProvider={new StaticTreeDataProvider(dataItem, (item, data) => ({ ...item, data }))}
        onSelectItems={(items: any) => {
          setSelectedItems(items)
          selectOrg(items)
        }}
        defaultInteractionMode={InteractionMode.ClickArrowToExpand}
        canSearch={true}
      >
        <Tree treeId={'complex-tree'} rootItem={'root'} ref={tree}></Tree>
      </UncontrolledTreeEnvironment>
    </>
  )
}

// new StaticTreeDataProvider(dataItem, (item, data) => ({ ...item, data }))

export { ComplexTree }