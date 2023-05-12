// import * as z from 'zod'
// import { useTranslation } from 'react-i18next'
// import { useEffect } from 'react'
// import { useSpinDelay } from 'spin-delay'

// import { Button } from '~/components/Button'
// import { Form, InputField } from '~/components/Form'
// import { Drawer } from '~/components/Drawer'
// import { Spinner } from '~/components/Spinner'
// import {
//   useGroupById,
//   useUpdateOrgGroup,
//   type UpdateGroupDTO,
// } from '../../api/groupAPI'

// import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
// import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

// const groupSchema = z.object({
//   ids: z.string(),
// })

// type UpdateGroupProps = {
//   groupId: string
//   close: () => void
//   isOpen: boolean
// }

// export function UpdateOrgGroup({ groupId, close, isOpen }: UpdateGroupProps) {
//   const { t } = useTranslation()

//   const { mutate, isLoading, isSuccess } = useUpdateOrgGroup()

//   const { data: groupData, isLoading: groupLoading } = useGroupById({
//     groupId,
//     config: { suspense: false },
//   })

//   useEffect(() => {
//     if (isSuccess) {
//       close()
//     }
//   }, [isSuccess, close])

//   const showSpinner = useSpinDelay(groupLoading, {
//     delay: 150,
//     minDuration: 300,
//   })

//   return (
//     <Drawer
//       isOpen={isOpen}
//       onClose={close}
//       title={t('cloud.org_manage.group_manage.add_group.edit')}
//       renderFooter={() => (
//         <>
//           <Button
//             className="rounded border-none"
//             variant="secondary"
//             size="lg"
//             onClick={close}
//             startIcon={
//               <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
//             }
//           />
//           <Button
//             className="rounded border-none"
//             form="update-group"
//             type="submit"
//             size="lg"
//             isLoading={isLoading}
//             startIcon={
//               <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
//             }
//           />
//         </>
//       )}
//     >
//       {groupLoading ? (
//         <div className="flex grow items-center justify-center">
//           <Spinner showSpinner={showSpinner} size="xl" />
//         </div>
//       ) : (
//         <Form<UpdateGroupDTO['data'], typeof groupSchema>
//           id="update-group"
//           onSubmit={values =>
//             mutate({
//               data: {
//                 ids: values.name,
//               },
//               groupId,
//             })
//           }
//           schema={groupSchema}
//           options={{
//             defaultValues: {
//               name: groupData?.name,
//             },
//           }}
//         >
//           {({ register, formState }) => (
//             <>
//               <InputField
//                 label={
//                   t('cloud.org_manage.group_manage.add_group.name') ??
//                   "Group's name"
//                 }
//                 error={formState.errors['name']}
//                 registration={register('name')}
//               />
//             </>
//           )}
//         </Form>
//       )}
//     </Drawer>
//   )
// }
