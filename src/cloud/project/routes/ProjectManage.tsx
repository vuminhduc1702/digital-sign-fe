import { useProjects } from '../api'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useProjectIdStore } from '~/stores/project'
import { ContentLayout } from '~/layout/ContentLayout'

import { BasePaginationSchema } from '~/utils/schemaValidation'

import TitleBar from '~/components/Head/TitleBar'
import { CreateProject } from '../components/CreateProject'
import { ComboBoxSelectProject } from '../components/ComboBoxSelectProject'
import { useState } from 'react'
import { ListProjectItem } from './../components/ListProjectItem'
import projectBackgroundImage from '~/assets/images/project-background.png'

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  description: z.string(),
  app_key: z.string(),
  app_secret: z.string(),
  sms_config: z.object({
    type: z.string(),
    config: z
      .object({
        code: z.string(),
        password: z.string(),
        service_id: z.string(),
        url: z.string(),
        user: z.string(),
      })
      .nullable(),
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
  const [filteredComboboxData, setFilteredComboboxData] = useState<Project[]>(
    [],
  )

  return (
    <ContentLayout title={t('cloud:project_manager.title')}>
      <div className="flex">
        <TitleBar
          className="w-full"
          title={t('cloud:project_manager.project')}
        />
        <div className="ml-3 flex items-center gap-x-3">
          <CreateProject />
          <ComboBoxSelectProject
            setFilteredComboboxData={setFilteredComboboxData}
          />
        </div>
      </div>

      <div
        className="mt-3"
        style={{
          height: '100%',
          backgroundImage: `url(${projectBackgroundImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 5% bottom 0',
        }}
      >
        {Number(projectsData?.total) > 0 ? (
          <>
            <div className="mb-4 text-h2 font-bold">
              {t('cloud:project_manager.count_project').replace(
                '{{NO_OF_PROJECT}}',
                Number(projectsData?.total).toString(),
              )}
            </div>
            <ListProjectItem listProjectData={filteredComboboxData} />
          </>
        ) : (
          <div>{t('cloud:project_manager.no_data')}</div>
        )}
      </div>
    </ContentLayout>
  )
}
