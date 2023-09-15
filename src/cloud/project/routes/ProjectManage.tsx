import { Link } from '~/components/Link'
import { useProjects } from '../api'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'
import { useProjectIdStore } from '~/stores/project'
import { ContentLayout } from '~/layout/ContentLayout'

import { BasePaginationSchema } from '~/utils/schemaValidation'

import defaultProjectImage from '~/assets/images/default-project.png'

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  description: z.string(),
  app_key: z.string(),
  app_secret: z.string(),
  sms_config: z.object({
    type: z.string(),
    config: z.object({
      code: z.string(),
      password: z.string(),
      service_id: z.string(),
      url: z.string(),
      user: z.string(),
    }).nullable(),
    content: z.string(),
    reset_password_content: z.string(),
  }),
})

export type Project = z.infer<typeof ProjectSchema>

export const ProjectListSchema = z
  .object({
    projects: z.array(ProjectSchema),
  })
  .and(BasePaginationSchema)

export function ProjectManage() {
  const { t } = useTranslation()

  const { data: projectsData } = useProjects()

  const setProjectId = useProjectIdStore(state => state.setProjectId)

  return (
    <ContentLayout title={t('cloud:project_manager.title')}>
      {projectsData?.projects.map((project: Project) => {
        return (
          <Link
            to={`${PATHS.ORG_MANAGE}/${project.id}`}
            key={project.id}
            onClick={() => {
              storage.setProject(project)
              setProjectId(project.id)
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
    </ContentLayout>
  )
}
