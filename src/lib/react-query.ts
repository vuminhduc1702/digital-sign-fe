import { type AxiosError } from 'axios'
import {
  QueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type DefaultOptions,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'

import { useNotificationStore } from '~/stores/notifications'
import i18n from '~/i18n'

const queryConfig: DefaultOptions = {
  queries: {
    useErrorBoundary: true,
    refetchOnWindowFocus: false,
    retry: 3,
    suspense: true,
    staleTime: 1000 * 60,
  },
}

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
  queryCache: new QueryCache({
    onError: error => {
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: i18n.t('error:server_res.title'),
        message: (error as AxiosError).message,
      })
    },
  }),
  mutationCache: new MutationCache({
    onError: error => {
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: i18n.t('error:server_res.title'),
        message: (error as AxiosError).message,
      })
    },
  }),
})

export type ExtractFnReturnType<FnType extends (...args: any) => any> = Awaited<
  Promise<ReturnType<FnType>>
>

export type QueryConfig<QueryFnType extends (...args: any) => any> = Omit<
  UseQueryOptions<ExtractFnReturnType<QueryFnType>>,
  'queryKey' | 'queryFn'
>

export type MutationConfig<MutationFnType extends (...args: any) => any> =
  UseMutationOptions<
    ExtractFnReturnType<MutationFnType>,
    AxiosError,
    Parameters<MutationFnType>[0]
  >
