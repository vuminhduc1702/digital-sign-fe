import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type GetDdosDTO } from '../../types'

export const getDdos = (data: GetDdosDTO) => {
  return axios.post('/ai/ddos', {
    ...data,
  })
}

type DdosQueryFnType = typeof getDdos

type UseDdos = {
  data: {
    tcp_srcport: number
    tcp_dstport: number
    ip_proto: number
    frame_len: number
    tcp_flags_syn: number
    tcp_flags_reset: number
    tcp_flags_push: number
    tcp_flags_ack: number
    ip_flags_mf: number
    ip_flags_df: number
    ip_flags_rb: number
    tcp_seq: number
    tcp_ack: number
    packets: number
    bytes: number
    tx_packets: number
    tx_bytes: number
    rx_packets: number
    rx_bytes: number
  }
  config?: QueryConfig<DdosQueryFnType>
}

export const useDdos = ({ config, data }: UseDdos) => {
  return useQuery<ExtractFnReturnType<DdosQueryFnType>>({
    queryKey: ['call-ddos-api', { ...data }],
    queryFn: () => getDdos({ ...data }),
    ...config,
  })
}
