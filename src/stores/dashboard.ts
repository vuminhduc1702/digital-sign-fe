import { create } from 'zustand'

type DashboardNameStore = {
  dashboardName: string
  setDashboardName: (dashboardName: string) => void
}

export const useDashboardNameStore = create<DashboardNameStore>(set => ({
  dashboardName: '',
  setDashboardName: dashboardName => set({ dashboardName }),
}))
