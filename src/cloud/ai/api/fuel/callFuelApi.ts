import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

type GetFuelDTO = {
    distance: number
    speed: number
    temp_inside: number
    gas_type: number
    AC: number
    rain: number
    sun: number
}

export const getFuel = (data: GetFuelDTO) => {
  return axios.post('/ai/fuel', {
      ...data
  })
}

type FuelQueryFnType = typeof getFuel

type UseFuel = {
  data: {
    distance: number
    speed: number
    temp_inside: number
    gas_type: number
    AC: number
    rain: number
    sun: number
  }
  config?: QueryConfig<FuelQueryFnType>
}

export const useFuel = ({ config, data }: UseFuel) => {
  return useQuery<ExtractFnReturnType<FuelQueryFnType>>({
    queryKey: ['call-fuel-api', {...data}],
    queryFn: () => getFuel({ ...data }),
    ...config,
  })
}
