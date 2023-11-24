// api.ts
import { axios } from '~/lib/axios'

export type RuleChain = {
  id: {
    entityType: string;
    id: string;
  };
  name: string;
};

export type ApiResponse = {
  data: RuleChain[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
};

export const fetchRuleChains = async (): Promise<ApiResponse> => {

    const response = await axios.get<ApiResponse>('http://api.innoway.vn/api/ruleChains?projectId=51a7b00e-beac-4f88-a0a5-dadf28c6cf08&pageSize=10&page=0');
    return response.data;
};
