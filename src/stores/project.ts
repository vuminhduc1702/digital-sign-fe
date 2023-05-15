import { create } from 'zustand'

type ProjectIdStore = {
  projectId: string
  projectName: string
  setProjectId: (projectId: string, projectName: string) => void
}

export const useProjectIdStore = create<ProjectIdStore>(set => ({
  // TODO: Remove default projectId later
  projectId: 'ad1431bf-1839-4060-a9ab-b6196cb1e10e',
  projectName: '',
  setProjectId: (projectId, projectName) => set({ projectId, projectName }),
}))
