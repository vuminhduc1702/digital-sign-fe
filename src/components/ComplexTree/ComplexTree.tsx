import { useEffect, useState } from "react";
import { ControlledTreeEnvironment, InteractionMode, StaticTreeDataProvider, Tree, TreeItem, TreeItemIndex, UncontrolledTreeEnvironment } from "react-complex-tree"
import 'react-complex-tree/lib/style-modern.css'

type ComplexTreeProps = {
  items: any,
  selectOrg: (item: any) => void,
  currentValue: any
}
const ComplexTree = ({
  items,
  selectOrg,
  currentValue
}: ComplexTreeProps) => {
  const [selectedItems, setSelectedItems] = useState();
  const [focusedItem, setFocusedItem] = useState();
  const [expandedItems, setExpandedItems] = useState<any>();
  const [dataItem, setDataItem] = useState<Record<TreeItemIndex, TreeItem>>({})
  let treeData = {}
  let parentArr: any[] = []

  function parseData(data: any) {
    if (data) {
      const rootItem = {
        root: {
          index: 'root',
          isFolder: true,
          children: data.map((item: any) => item.name),
          data: 'Root item',
        }
      }
      treeData = {...treeData, ...rootItem}
      data.forEach((item: any) => {
        treeData = {...treeData, ...parseOrg(item)}
      })
      setDataItem(treeData)
    }
  }

  function parseOrg(data: any) {
    let childrenArr: string[] = []
    if (data.sub_orgs) {
      data.sub_orgs.forEach((item: any) => {
        childrenArr.push(item.name)
        parseOrg(item)
      })
      const treeItemNested = {
        [data.name]: {
          index: data.name,
          data: data.name,
          parent: data.parent_name,
          isFolder: true,
          children: childrenArr
        }
      }
      treeData = {...treeData, ...treeItemNested}
    } else {
      const treeItem = {
        [data.name]: {
          index: data.name,
          data: data.name,
          parent: data.parent_name,
          isFolder: false,
        }
      }
      treeData = {...treeData, ...treeItem}
    }
    return treeData
  }

  function getParent(item: any) {
    if (item && dataItem[item] && dataItem[item].parent) {
      const newItem = dataItem[dataItem[item].data].parent
      parentArr = parentArr.concat(dataItem[item].parent)
      if (newItem) {
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
    if (selectedItems) {
      const test = getParent(selectedItems)
      setExpandedItems(test)
    } else {
      setExpandedItems(getParent(currentValue))
    }
  }, [selectedItems, currentValue])

  useEffect(() => {
    console.log(currentValue)
  }, [currentValue])

  return (
    <>
      <UncontrolledTreeEnvironment
        viewState={{
          ['complex-tree']: {
            focusedItem,
            expandedItems: expandedItems,
            selectedItems: selectedItems ? [selectedItems] : [],
          }
        }}
        getItemTitle={item => item.data}
        dataProvider={new StaticTreeDataProvider(dataItem, (item, data) => ({ ...item, data }))}
        onSelectItems={(items: any) => {
          setSelectedItems(items)
          selectOrg(items)
        }}
        defaultInteractionMode={InteractionMode.ClickArrowToExpand}
      >
        <Tree treeId={'complex-tree'} rootItem={'root'}></Tree>
      </UncontrolledTreeEnvironment>
    </>
  )
}

export { ComplexTree }