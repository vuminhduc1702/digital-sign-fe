export type GetDdosDTO = {
    data:{
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
        bytes: number,
        tx_packets: number,
        tx_bytes: number,
        rx_packets: number,
        rx_bytes: number
    }
  }

  export type GetFuelDTO = {
        distance: number
        speed: number
        temp_inside: number
        gas_type: number
        AC: number
        rain: number
        sun: number
  } 