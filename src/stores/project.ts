import { create } from 'zustand'

type ProjectIdStore = {
  projectId: string
  setProjectId: (projectId: string) => void
}

export const useProjectIdStore = create<ProjectIdStore>(set => ({
  projectId: '',
  setProjectId: projectId => set({ projectId }),
}))
