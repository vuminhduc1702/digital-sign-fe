import { create } from 'zustand'

type ProjectIdStore = {
  projectId: string
  projectName: string
  setProjectId: (projectId: string, projectName: string) => void
}

export const useProjectIdStore = create<ProjectIdStore>(set => ({
  // TODO: Remove default projectId later
  projectId: 'f5e85007-fad9-46fc-a993-f0121b6f3ecd',
  projectName: "smarthome's Finn",
  setProjectId: (projectId, projectName) => set({ projectId, projectName }),
}))
