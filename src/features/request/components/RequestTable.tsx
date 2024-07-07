import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { CertificateRequest } from "../types"
import { LuPlus } from "react-icons/lu"
import { BaseTable } from "@/components/Table"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { certRequestList } from "../mock-data"
import { convertDate } from "@/utils/moment"
import { useDisclosure } from "@/utils/hooks"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { useCreateCertRequest } from "../api/createCertRequest"
import { useGetCertRequest } from "../api/getCertRequest"
import { useCreateCert } from "../api/createCert"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { HiOutlineXMark } from "react-icons/hi2"
import { Input } from "@/components/ui/input"
import { EyeHide, EyeShow } from "@/components/SVGIcons"

const status = [
    {
        value: '0',
        label: 'Tất cả'
    },
    {
        value: '1',
        label: 'Đang chờ duyệt'
    },
    {
        value: '2',
        label: 'Được phê duyệt'
    },
    {
        value: '3',
        label: 'Bị từ chối'
    },
    {
        value: '4',
        label: "Đã tạo chứng thư"
    }
]

type RequestStatusProps = {
    actionId: number
    actionDesc: string
}

function RequestStatus({actionId, actionDesc}: RequestStatusProps) {
    switch (actionId) {
        case 1: return <span className="text-yellow-600">Đang chờ duyệt</span>
        case 2: return <span className="text-green-600">Được phê duyệt</span>
        case 3: return <span className="text-red-600">Bị từ chối</span>
        case 4: return <span className="text-secondary-700">Đã tạo chứng thư</span>
    }
}

type RequestActionProps = {
    request: CertificateRequest
}

function RequestAction({request}: RequestActionProps) {
    const {t} = useTranslation()
    const requestId = Number(request.requestId)

    const [showPassword, setShowPassword] = useState<boolean>(false)

    const form = useForm()

    const {control, handleSubmit} = form

    const {
        mutate: mutateCreateCert,
        isLoading: isLoadingCreateCert,
        isSuccess: isSuccessCreateCert
    } = useCreateCert({})

    const {
        close: closeConfirmCreateCert,
        open: openConfirmCreateCert,
        isOpen: isOpenConfirmCreateCert,
    } = useDisclosure()

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev)
      }

    useEffect(() => {
        if (isSuccessCreateCert) {
            closeConfirmCreateCert()
        }
    }, [isSuccessCreateCert])

    if (request.actionId !== 2) return
    return <div className="flex">
        <div className="flex cursor-pointer justify-center p-3">
            <div 
                className="flex items-center gap-2 text-sm text-secondary-800 transition-all duration-200 ease-in-out hover:scale-105 hover:text-black"
                onClick={openConfirmCreateCert}
            >
            <LuPlus />
            Tạo chứng thư
            </div>
        </div>
        {isOpenConfirmCreateCert && (
            <Dialog isOpen={isOpenConfirmCreateCert} onClose={closeConfirmCreateCert}>
            <div className="inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6 sm:align-middle">
              <div className="absolute -right-3 -top-3">
                <button
                  className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                  onClick={closeConfirmCreateCert}
                >
                  <span className="sr-only">Close panel</span>
                  <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-col items-center justify-between mt-3 min-h-96 text-center sm:mt-0 sm:text-left">
                <div className="flex-1">
                  <DialogTitle className="mb-4 text-h1 self-center text-secondary-900">
                    Điền mật khẩu để tạo chứng thư
                  </DialogTitle>
                  <Form {...form}>
                    <form
                        id="create-cert"
                        onSubmit={handleSubmit(async values => {
                            console.log(values)
                            mutateCreateCert({
                                requestId: requestId,
                                password: values.password
                            })
                        })}
                    >
                        <FormField
                            control={control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('certificate:dialog.password')}</FormLabel>
                                <FormControl>
                                <Input
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mật khẩu"
                                    autoComplete="nope"
                                    endIcon={
                                    showPassword ? (
                                        <EyeShow
                                        height={24}
                                        width={24}
                                        viewBox="0 0 24 24"
                                        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
                                        onClick={togglePasswordVisibility}
                                        />
                                    ) : (
                                        <EyeHide
                                        height={24}
                                        width={24}
                                        viewBox="0 0 24 24"
                                        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
                                        onClick={togglePasswordVisibility}
                                        />
                                    )
                                    }
                                />
                                </FormControl>
                            </FormItem>
                            )}
                        />
                    </form>
                  </Form>
                </div>
                <div className="flex mt-8 items-center justify-center gap-4">
                  <Button form="create-cert" type="submit" isLoading={isLoadingCreateCert}>Tạo</Button>
                  <Button variant="secondaryLight" onClick={closeConfirmCreateCert}>Huỷ bỏ</Button>
                </div>
              </div>
            </div>
          </Dialog>
        )}
    </div>
}

export function RequestTable({}) {
    const {t} = useTranslation()

    const [page, setPage] = useState<number>(1)

    const pagePrev = useRef<number>(page)

    const form = useForm()

    const {setValue, getValues, watch, register, control} = form

    const {
        mutate: mutateRequest,
        isSuccess: requestIsSuccess,
        isLoading: requestIsLoading
    } = useCreateCertRequest()

    const {
        data: getRequestData,
        isPreviousData: isPreviousDataGetRequest,
        isLoading: isLoadingGetRequest
    } = useGetCertRequest({
        pageNum: page,
        status: watch('status') ? Number(watch('status')) : 0
    })

    const {
        close: closeConfirmCreate,
        open: openConfirmCreate,
        isOpen: isOpenConfirmCreate
    } = useDisclosure()

    // useEffect(() => {
    //     if (!isPreviousData) {
    //       pagePrev.current = page
    //     }
    //   }, [isPreviousData, page])

    const columnHelper = createColumnHelper<CertificateRequest>()
    const columns  = useMemo<ColumnDef<CertificateRequest, any>[]>(
        () => [
            columnHelper.display({
                id: 'stt',
                cell: info => {
                  return info.row.index + page
                //   !isPreviousData
                //     ? info.row.index + page
                //     : info.row.index + pagePrev.current
                },
                header: () => <span>{t('request:stt')}</span>,
                footer: info => info.column.id,
              }),
              columnHelper.accessor('registTs', {
                id: 'registTs',
                header: () => <span>{t('request:regist_ts')}</span>,
                cell: info => convertDate(info.row.original.registTs),
                footer: info => info.column.id,
              }),
              columnHelper.accessor('updateTs', {
                id: 'updateTs',
                header: () => <span>{t('request:update_ts')}</span>,
                cell: info => convertDate(info.row.original.updateTs),
                footer: info => info.column.id,
              }),
              columnHelper.accessor('isValid', {
                id: 'isValid',
                header: () => <span>{t('request:is_valid')}</span>,
                cell: info => {
                    return info.row.original.isValid ? 'Hợp lệ' : 'Không hợp lệ'
                },
                footer: info => info.column.id,
              }),
              columnHelper.accessor('actionId', {
                id: 'actionId',
                header: () => <span>{t('request:status')}</span>,
                cell: info => {
                    return RequestStatus({actionId: info.row.original.actionId, actionDesc: info.row.original.actionDesc})
                },
                footer: info => info.column.id,
              }),
              columnHelper.display({
                id: 'action',
                header: () => <span>{t('request:action')}</span>,
                cell: info => {
                  return RequestAction({ request: info.row.original })
                },
                footer: info => info.column.id,
              }),
        ],
        []
    )

    useEffect(() => {
        setValue('status', '0')
    }, [])

    useEffect(() => {
        if (requestIsSuccess) {
            closeConfirmCreate()
        }
    }, [requestIsSuccess])

    console.log(watch('status'))

    return (
    <div className="bg-white p-6 rounded-lg">
        <div className="flex items-end justify-between">
            <div className="w-full my-4">
            <Form {...form}>
                <form>
                    <FormField 
                        control = {control}
                        name = "status"
                        render = {({field: {onChange, value, ...field}}) => (
                            <FormItem className="w-1/5">
                                <FormLabel>
                                    {t('request:filter')}
                                </FormLabel>
                                <FormControl>
                                    <div>
                                        <Select
                                            onValueChange={onChange}
                                            value={value}    
                                            {...field}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {status.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FormControl>
                            </FormItem>
                            )}
                        />
                    </form>
                </Form>
                </div>
                <Button className="w-36 h-9" variant="primary" startIcon={<LuPlus className="w-4 h-4"/>} onClick={openConfirmCreate}>
                    {t('request:new_request')}
                </Button>
            </div>
        <BaseTable 
            data = {getRequestData?.data || []}
            columns = {columns}
            isCheckbox = {false}
            offset = {page}
            setOffset = {setPage}
            total = {getRequestData?.meta?.total || getRequestData?.data?.length}
            isLoading = {isLoadingGetRequest}
            isPreviousData = {isPreviousDataGetRequest}
        />
        <ConfirmDialog 
            icon="info"
            title={t("request:confirm_dialog.title")}
            body={t("request:confirm_dialog.body")}
            close={closeConfirmCreate}
            isOpen={isOpenConfirmCreate}
            handleSubmit={() => {
                mutateRequest({})
            }}
            isLoading={requestIsLoading}
        />
        </div>)
}