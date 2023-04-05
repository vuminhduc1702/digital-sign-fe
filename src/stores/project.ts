import { create } from 'zustand'

type ProjectIdStore = {
  projectId: string
  projectName: string
  setProjectId: (projectId: string, projectName: string) => void
}

export const useProjectIdStore = create<ProjectIdStore>(set => ({
  // TODO: Remove default projectId later
  projectId: '7d7025f0-e0be-4336-9843-8b3a21a34a77',
  // projectId: '33b8dbd7-681c-4736-a232-583946962e40',
  projectName: '',
  setProjectId: (projectId, projectName) => set({ projectId, projectName }),
}))
