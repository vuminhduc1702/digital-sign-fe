import { axios } from "~/lib/axios"
import { Project } from "../routes/ProjectManage"

export const backupProject = ({
  projectId,
}: {
  projectId: string | undefined
}): Promise<Project> => {
  return axios.get(`/api/projects/backup/${projectId}`)
}