import { create } from 'zustand'

type ProjectIdStore = {
  projectId: string
  projectName: string
  setProjectId: (projectId: string, projectName: string) => void
}

export const useProjectIdStore = create<ProjectIdStore>(set => ({
  // TODO: Remove default projectId later
  projectId: 'f5e85007-fad9-46fc-a993-f0121b6f3ecd',
  // projectId: '33b8dbd7-681c-4736-a232-583946962e40',
  projectName: "smarthome's Finn",
  setProjectId: (projectId, projectName) => set({ projectId, projectName }),
}))
