import { create } from 'zustand'

type ProjectIdStore = {
  projectId: string
  projectName: string
  setProjectId: (projectId: string, projectName: string) => void
}

export const useProjectIdStore = create<ProjectIdStore>(set => ({
  // TODO: Remove default projectId later
  projectId: 'a2c69b38-5508-42b6-8c18-a6ffdc3f7deb',
  projectName: "smarthome's Finn",
  setProjectId: (projectId, projectName) => set({ projectId, projectName }),
}))
