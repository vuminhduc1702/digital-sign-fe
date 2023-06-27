import { Link } from '~/components/Link'
import { useProjects } from '../api'

import { type Project } from '../types'
import { PATHS } from '~/routes/PATHS'
import { useProjectIdStore } from '~/stores/project'

import defaultProjectImage from '~/assets/images/default-project.png'

export function ProjectManage() {
  const setProjectId = useProjectIdStore(state => state.setProjectId)

  const { data: projectsData } = useProjects()

  return (
    <>
      {projectsData?.projects.map((project: Project) => {
        return (
          <Link
            to={`${PATHS.ORG_MANAGE}/${project.id}`}
            key={project.id}
            onClick={() => {
              setProjectId(project.id, project.name)
            }}
          >
            <div className="flex gap-x-3">
              <img
                src={project?.image || defaultProjectImage}
                alt="Project"
                className="aspect-square w-[45px] rounded-full"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.onerror = null
                  target.src = defaultProjectImage
                }}
              />
              <div className="space-y-1">
                <p className="text-h2">{project.name}</p>
                <p>{project.description}</p>
              </div>
            </div>
          </Link>
        )
      })}
    </>
  )
}
