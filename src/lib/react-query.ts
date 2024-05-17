import { type AxiosError } from 'axios'
import {
  QueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type DefaultOptions,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import i18n from '@/i18n'
import storage from '@/utils/storage'

const queryConfig: DefaultOptions = {
  queries: {
    useErrorBoundary: false,
    suspense: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: (failureCount, error: any) => {
      if (
        storage.getIsPersistLogin() === 'true' &&
        error.response?.status === 401
      ) {
        return true
      }

      const shouldRetry =
        error.response?.status !== 403 &&
        error.response?.status !== 401 &&
        error.response?.status != null &&
        failureCount < 3

      return shouldRetry
    },
    retryDelay: attemptIndex =>
      Math.min(Math.pow(2, attemptIndex) * 1000, 10000),
    staleTime: 1000 * 60,
  },
}

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
  queryCache: new QueryCache({
    onError: error => {
      if (storage.getIsPersistLogin() === 'false') {
        return
      }
      toast.error(i18n.t('error:server_res.title'), {
        description: (error as AxiosError).message,
      })
    },
  }),
  mutationCache: new MutationCache({
    onError: error => {
      if (storage.getIsPersistLogin() === 'false') {
        return
      }
      toast.error(i18n.t('error:server_res.title'), {
        description: (error as AxiosError).message,
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
