import { create } from 'zustand'

type OrgIdStore = {
  orgId: string
  setOrgId: (orgId: string) => void
}

export const useOrgIdStore = create<OrgIdStore>(set => ({
  orgId: '',
  setOrgId: orgId => set({ orgId }),
}))
