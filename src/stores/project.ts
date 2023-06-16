import { create } from 'zustand'

type ProjectIdStore = {
  projectId: string
  projectName: string
  setProjectId: (projectId: string, projectName: string) => void
}

export const useProjectIdStore = create<ProjectIdStore>(set => ({
  // TODO: Remove default projectId later
  projectId: '4aa509bb-0638-483b-a290-280b0c21d96f',
  projectName: '',
  setProjectId: (projectId, projectName) => set({ projectId, projectName }),
}))
