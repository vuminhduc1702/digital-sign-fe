import { useEffect, useState } from "react";
import { InteractionMode, StaticTreeDataProvider, Tree, TreeItem, TreeItemIndex, ControlledTreeEnvironment } from "react-complex-tree"
import 'react-complex-tree/lib/style-modern.css'
import { Org } from "~/layout/MainLayout/types";

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
  const [selectedItems, setSelectedItems] = useState();
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex | string>();
  const [expandedItems, setExpandedItems] = useState<Array<TreeItemIndex>>([]);
  const [dataItem, setDataItem] = useState<Record<TreeItemIndex, TreeItem>>({})
  let treeData = {}
  let parentArr: Org[] = []

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
          parent: data.parent_name,
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
          parent: data.parent_name,
          isFolder: false,
        }
      }
      treeData = {...treeData, ...treeItem}
    }
    return treeData
  }

  // function getParent(item: any) {
  //   if (item && dataItem[item] && dataItem[item].parent) {
  //     const newItem = dataItem[dataItem[item].data].parent
  //     parentArr = parentArr.concat(dataItem[item].parent)
  //     if (newItem) {
  //       getParent(newItem)
  //     }
  //   } else if (!dataItem[item] || !dataItem[item].parent) {
  //     return parentArr
  //   }
  //   return parentArr
  // }

  useEffect(() => {
    if (items) {
      parseData(items)
    }
  }, [items])

  // useEffect(() => {
  //   if (selectedItems) {
  //     const expanded = getParent(selectedItems)
  //     setExpandedItems(expanded)
  //   } else {
  //     setExpandedItems(getParent(currentValue))
  //   }
  // }, [selectedItems, currentValue])

  return (
    <>
      <ControlledTreeEnvironment
        viewState={{
          'complex-tree': {
            focusedItem,
            expandedItems: expandedItems,
            selectedItems: selectedItems ? [selectedItems] : [],
          }
        }}
        getItemTitle={item => item.data.name}
        items={dataItem}
        onFocusItem={item => setFocusedItem(item.index)}
        onExpandItem={item => setExpandedItems([...expandedItems, item.index])}
        onCollapseItem={item =>
          setExpandedItems(expandedItems.filter((expandedItemIndex: any) => expandedItemIndex !== item.index))
        }
        onSelectItems={(items: any) => {
          setSelectedItems(items)
          selectOrg(items)
        }}
        defaultInteractionMode={InteractionMode.ClickArrowToExpand}
      >
        <Tree treeId={'complex-tree'} rootItem={'root'}></Tree>
      </ControlledTreeEnvironment>
    </>
  )
}

// new StaticTreeDataProvider(dataItem, (item, data) => ({ ...item, data }))

export { ComplexTree }