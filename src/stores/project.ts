import { create } from 'zustand'

type ProjectIdStore = {
  projectId: string
  projectName: string
  setProjectId: (projectId: string, projectName: string) => void
}

export const useProjectIdStore = create<ProjectIdStore>(set => ({
  projectId: '',
  projectName: '',
  setProjectId: (projectId, projectName) => set({ projectId, projectName }),
}))
