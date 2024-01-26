import React from 'react';
import { Tree, RenderCustomNodeElementFn } from 'react-d3-tree';
import storage from '~/utils/storage';
import { useProjectById } from '~/cloud/project/api';
import { useGetOrgs } from '~/layout/MainLayout/api';
import { type Org } from '~/layout/MainLayout/types';
import '~/style/treeComponent.css';

export function OrgMap() {
  const projectId = storage.getProject()?.id;
  const { data: projectByIdData } = useProjectById({
    projectId,
    config: { enabled: !!projectId },
  });
  const { data: orgData } = useGetOrgs({ projectId });

  function convertOrgToTree(org: Org): any {
    return {
      name: org.name,
      attributes: { level: org.level },
      children: org.sub_orgs ? org.sub_orgs.map(convertOrgToTree) : [],
    }
  }

  // const renderCustomNode: RenderCustomNodeElementFn = ({
  //   nodeDatum,
  //   hierarchyPointNode,
  //   toggleNode,
  //   onNodeClick,
  //   onNodeMouseOver,
  //   onNodeMouseOut,
  //   addChildren,
  // }) => {
  //   // Thực hiện việc tạo ra phần tử JSX của node theo ý muốn
  //   const rectWidth = 150;
  //   const rectHeight = 50;
  //   return (
  //     <g>
  //       {/* Hình chữ nhật */}
  //       <rect
  //         width={rectWidth}
  //         height={rectHeight}
  //         fill=""
  //         onClick={toggleNode}
  //         onMouseOver={onNodeMouseOver}
  //         onMouseOut={onNodeMouseOut}
  //       />
  //       {/* Hiển thị thông tin bên trong hình chữ nhật */}
  //       {/* <div className="node-text"> */}
  //         <text x={rectWidth / 2} y={rectHeight / 2} dominantBaseline="middle" textAnchor="middle" fill="white">
  //           {nodeDatum.name}
  //         </text>
  //       {/* </div> */}
  //       {/* Thêm bất kỳ phần tử JSX hoặc logic xử lý tại đây */}
  //     </g>
  //   );
  // };
  const renderRectSvgNode: RenderCustomNodeElementFn =({ nodeDatum, toggleNode }) => (
    
    <g>
      <rect fill="pink" width="140" height="80" x="-70" y="-40" onClick={toggleNode} />
      <text fill="black" strokeWidth="1" x="-45" y="-10" fontFamily="" fontWeight="normal" fontSize="20px">
        {nodeDatum.name}
      </text>
      {/* {nodeDatum.attributes?.department && (
        <text fill="black" x="20" dy="20" strokeWidth="1">
          Department: {nodeDatum.attributes?.department}
        </text>
      )} */}
    </g>
  )
  const treeData: any = {
    name: projectByIdData?.name || 'Default Project',
    children: orgData?.organizations.map(convertOrgToTree),
  }
  return (
    <div className="grow items-center justify-center">
      <Tree
        data={treeData}
        orientation="vertical"
        pathFunc="step"
        nodeSize={{ x: 80, y: 150 }}
        svgClassName="custom-svg-class"
        translate={{ x: 700, y: 150 }}
        scaleExtent={{ min: 0.5, max: 2 }}
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
        separation={{ siblings: 2, nonSiblings: 2 }}
        renderCustomNodeElement={renderRectSvgNode}
      />
    </div>
  )
}
