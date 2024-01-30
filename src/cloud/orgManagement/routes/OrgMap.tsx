import Tooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap.css'
import { useState } from 'react'
import { type RenderCustomNodeElementFn, Tree } from 'react-d3-tree'
import { useNavigate } from 'react-router-dom'
import { useProjectById } from '~/cloud/project/api'
import { useGetOrgs } from '~/layout/MainLayout/api'
import { type Org } from '~/layout/MainLayout/types'
import { PATHS } from '~/routes/PATHS'
import '~/style/treeComponent.css'
import storage from '~/utils/storage'

export function OrgMap() {
  const projectId = storage.getProject()?.id
  const navigate = useNavigate()
  const { data: projectByIdData } = useProjectById({
    projectId,
    config: { enabled: !!projectId },
  })

  const { data: orgData } = useGetOrgs({ projectId })

  function convertOrgToTree(org: Org): any {
    return {
      name: org.name,
      attributes: {
        id: org.id,
        level: org.level,
        description: org.description,
      },
      children: org.sub_orgs ? org.sub_orgs.map(convertOrgToTree) : [],
    }
  }

  const handleTextClick = nodeDatum => {
    return navigate(
      `${PATHS.ORG_MANAGE}/${projectId}/${nodeDatum?.attributes.id}`,
    )
  }

  const renderRectSvgNode: RenderCustomNodeElementFn = ({
    nodeDatum,
    toggleNode,
  }) => {
    const levelString: string | undefined =
      nodeDatum.attributes?.level?.toString()
    const hasChildren = nodeDatum.children?.length
    const isNodeExpanded = nodeDatum.__rd3t.collapsed !== true
    const handleToggleNode = () => {
      toggleNode()
    }
    return (
      <g className={`custom-node custom-node-${levelString || '0'}`}>
        <Tooltip
          placement="rightTop"
          overlay={
            <div>
              {/* <p>ID:  {nodeDatum.attributes?.id}</p> */}
              <p>Tên: {nodeDatum.name}</p>
              <p>Mô tả: {nodeDatum.attributes?.description}</p>
            </div>
          }
        >
          <rect
            width="140"
            height="80"
            x="-70"
            y="-40"
            onClick={() => {
              handleTextClick(nodeDatum)
            }}
          />
        </Tooltip>
        <text
          fill="black"
          strokeWidth="1"
          x="0"
          y="0"
          fontWeight="normal"
          fontSize="15px"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {nodeDatum.name.length > 9
            ? `${nodeDatum.name.slice(0, 9)}...`
            : nodeDatum.name}
        </text>
        {hasChildren ? (
          <g>
            <circle
              cx={0}
              cy={40}
              r={12}
              fill="white"
              stroke="black"
              strokeWidth={1}
              onClick={handleToggleNode}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={0}
              y={40}
              fontSize="15px"
              textAnchor="middle"
              dy=".3em"
              onClick={handleToggleNode}
              style={{ cursor: 'pointer' }}
            >
              {isNodeExpanded ? '-' : '+'}
            </text>
          </g>
        ) : null}
      </g>
    )
  }

  const [isButtonClicked, setButtonClicked] = useState(false)
  const handleButtonClick = () => {
    setButtonClicked(prevIsButtonClicked => !prevIsButtonClicked)
  }

  const treeData: any = {
    name: projectByIdData?.name || 'Default Project',
    children: orgData?.organizations.map(convertOrgToTree),
  }

  return (
    <div className="grow items-center justify-center">
      <button
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
        onClick={handleButtonClick}
      >
        {isButtonClicked ? 'Collapse' : 'Expand'}
      </button>
      <Tree
        data={treeData}
        orientation="vertical"
        pathFunc="step"
        nodeSize={{ x: 80, y: 150 }}
        svgClassName={`custom-svg-class-0`}
        translate={{ x: 600, y: 150 }}
        scaleExtent={{ min: 0.5, max: 2 }}
        separation={{ siblings: 2, nonSiblings: 2 }}
        renderCustomNodeElement={rd3tProps =>
          renderRectSvgNode({ ...rd3tProps })
        }
        initialDepth={isButtonClicked ? treeData.depth : 0}
      />
    </div>
  )
}
