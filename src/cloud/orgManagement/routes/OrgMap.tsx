import React from 'react'
import Tree from 'react-d3-tree'
import storage from '~/utils/storage'
import { useProjectById } from '~/cloud/project/api'
import { useGetOrgs } from '~/layout/MainLayout/api'
import { OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'


export function OrgMap() {
  const projectId = storage.getProject()?.id
  const { data: projectByIdData } = useProjectById({
    projectId,
    config: { enabled: !!projectId },
  })
  const { data: orgData } = useGetOrgs({ projectId })
  console.log('gggggdata', orgData?.organizations)
  const data = {
    name: projectByIdData?.name,
    children: [
      {
        name: 'Child 1',
        children: [
          { name: 'Grandchild 1' },
          { name: 'Grandchild 2' },
        ],
      },
      {
        name: 'Child 2',
      },
    ],
  }
  function convertDataToTree(data: OrgMapType): any {
    return {
      name: data.name,
      attributes: { id: data.id, level: data.level, description: data.description },
      children: data.children.map((child) => convertDataToTree(child)),
    }
  }
 
   //return <div>Vui lòng tạo/chọn tổ chức trước</div>
  // const renderCustomNode = ({ nodeData, toggleNode }) => (
  //   <g>
  //     <circle r={10} onClick={toggleNode} />
  //     <text x={-10} y={-10} textAnchor="end">
  //       {nodeData.name}
  //     </text>
  //   </g>
  // )
  return (
    <div className=" grow items-center justify-center">
      < Tree
        data={data}
        orientation="vertical"
        nodeSize={{ x: 200, y: 100 }}
        //nodeSvgShape={{ shape: 'circle', shapeProps: { r: 10 } }}
        //renderCustomNode={renderCustomNode}
      />
    </div>
  )
}
