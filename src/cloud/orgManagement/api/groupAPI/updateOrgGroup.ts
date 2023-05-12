// import { useMutation } from '@tanstack/react-query'

// import { axios } from '~/lib/axios'
// import { type MutationConfig, queryClient } from '~/lib/react-query'
// import { useNotificationStore } from '~/stores/notifications'

// export type UpdateOrgGroupDTO = {
//   data: {
//     ids: string[]
//     org_id: string
//   }
// }

// export const updateOrgGroup = ({ data }: UpdateOrgGroupDTO) => {
//   return axios.put('/api/groups/organization', data)
// }

// type UseUpdateOrgGroupOptions = {
//   config?: MutationConfig<typeof updateOrgGroup>
// }

// export const useUpdateOrgGroup = ({
//   config,
// }: UseUpdateOrgGroupOptions = {}) => {
//   const { addNotification } = useNotificationStore()

//   return useMutation({
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({
//         queryKey: ['groups'],
//       })
//       addNotification({
//         type: 'success',
//         title: 'Chuyển tổ chức thành công',
//       })
//     },
//     ...config,
//     mutationFn: updateOrgGroup,
//   })
// }
