import { SelectDropdown } from "@/components/Form/SelectDropdown";
import { Dialog, DialogContent, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HiOutlineXMark } from "react-icons/hi2";
import { useSearchUser } from "../api/searchUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateGroup } from "../api/createGroup";
import { useEffect } from "react";

type DialogProps = {
    close: () => void
    isOpen: boolean
}

export function CreateGroup({close, isOpen}: DialogProps) {
    const {t} = useTranslation()
    const form = useForm()
    const {control, getValues, handleSubmit} = form

    const {
        data: searchUserData,
        isLoading: isLoadingSearchUser
    } = useSearchUser({
        email: ''
    })

    const {
        mutate: mutateCreateGroup,
        isLoading: isLoadingCreateGroup,
        isSuccess: isSuccessCreateGroup
    } = useCreateGroup({})

    const searchOptions = searchUserData?.map(option => (
        {
            value: option.userId,
            label: option.userEmail
        }
    ))

    useEffect(() => {
        if (isSuccessCreateGroup) {
            close()
        }
    }, [isSuccessCreateGroup])

    return (
        <Dialog isOpen={isOpen} onClose={close}>
            <div className="inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6 sm:align-middle">
                <div className="absolute -right-3 -top-3">
                    <button
                        className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                        onClick={close}
                    >
                        <span className="sr-only">Close panel</span>
                        <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center mt-3 text-center sm:mt-0 sm:text-left">
                    <div className="flex w-full flex-col justify-between space-y-6">
                        <DialogTitle className="self-center">
                            Tạo nhóm
                        </DialogTitle>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(async values => {
                                const userIds = values.user.map(user => user.value)
                                const data = {
                                    groupName: values.name,
                                    userIds: userIds
                                }
                                await mutateCreateGroup(data)
                            })}>
                                <FormField 
                                    control={control}
                                    name="name"
                                    render={({field}) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>
                                                Tên nhóm:
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField 
                                    control={control}
                                    name="user"
                                    render={({field: {value, onChange, ...field}}) => (
                                        <FormItem>
                                            <FormLabel>
                                                Chọn thành viên:
                                            </FormLabel>
                                            <FormControl>
                                                <SelectDropdown 
                                                    isMulti={true}
                                                    isSearchable={true}
                                                    options={searchOptions}
                                                    onChange={onChange}
                                                    value={value}
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center justify-center mt-4 gap-4">
                                    <Button type="submit" isLoading={isLoadingCreateGroup}>
                                        Tạo nhóm
                                    </Button>
                                    <Button variant="secondaryLight" onClick={close}>
                                        Huỷ
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}