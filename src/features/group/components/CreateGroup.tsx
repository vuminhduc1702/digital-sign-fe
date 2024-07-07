import { SelectDropdown } from "@/components/Form/SelectDropdown";
import { Dialog, DialogContent, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HiOutlineXMark } from "react-icons/hi2";
import { useSearchUser } from "../api/searchUser";

type DialogProps = {
    close: () => void
    isOpen: boolean
}

export function CreateGroup({close, isOpen}: DialogProps) {
    const {t} = useTranslation()
    const form = useForm()
    const {control} = form

    const {
        data: searchUserData,
        isLoading: isLoadingSearchUser
    } = useSearchUser({
        email: ''
    })

    const searchOptions = searchUserData?.map(option => (
        {
            value: option.userId,
            label: option.userEmail
        }
    ))

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
                        <DialogTitle>

                        </DialogTitle>
                        <Form {...form}>
                            <form>
                                <FormField 
                                    control={control}
                                    name="user"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>
                                                Tạo nhóm
                                            </FormLabel>
                                            <FormControl>
                                                <SelectDropdown 
                                                    isMulti={true}
                                                    isSearchable={true}
                                                    options={searchOptions}
                                                    customOnChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}