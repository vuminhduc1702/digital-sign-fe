import { EyeHide, EyeShow } from '@/components/SVGIcons'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio'
import { useGetCertificateList } from '@/features/certificate/api/getCertificateList'
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
  useDisclosure,
} from '@/utils/hooks'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineXMark } from 'react-icons/hi2'
import { LuFolderUp, LuTrash } from 'react-icons/lu'
import { useSign } from '../api/sign'
import TitleBar from '@/components/Head/TitleBar'
import { Skeleton } from '@/components/ui/skeleton'
import { Certificate } from '@/features/certificate/types'
import { Loading } from '@/components/Loading'
import { downloadFile } from '@/features/history/api/downloadFile'
import { SelectDropdown } from '@/components/Form/SelectDropdown'
import { formatBytes } from '@/utils/transformFunc'
import { groupList } from '../mock-data'
import { Calendar } from '@/components/ui/calendar'
import { DateTime } from '@/components/DateTime'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useGetGroupList } from '@/features/group/api/getGroupList'
import { useCreateSignRequest } from '@/features/sign-request'

export function SignForm() {
  const { t } = useTranslation()
  const form = useForm()
  const {getValues, reset} = form
  const groupForm = useForm()

  const {
    data: certificateData,
    isLoading: certificateIsLoading,
    isSuccess: certificateIsSuccess,
  } = useGetCertificateList({})

  const {
    data: groupData,
    isLoading: groupListIsLoading
  } = useGetGroupList({
      pageNum: 1,
      pageSize: 100
  })

  const { mutateAsync: mutateSign, isSuccess: signIsSuccess, isLoading: signIsLoading } = useSign()

  const {
    mutateAsync: mutateCreateSignRequest, 
    isSuccess: createSignRequestIsSuccess, 
    isLoading: createSignRequestIsLoading
  } = useCreateSignRequest({})

  const {
    close: closeSelectCert,
    open: openSelectCert,
    isOpen: isOpenSelectCert,
  } = useDisclosure()

  const {
    close: closeInfoForm,
    open: openInfoForm,
    isOpen: isOpenInfoForm,
  } = useDisclosure()

  const {
    close: closeSelectGroup,
    open: openSelectGroup,
    isOpen: isOpenSelectGroup
  } = useDisclosure()

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [uploadFileErr, setUploadFileErr] = useState('')

  const groupOptions = groupData?.data?.map(group => (
    {
      value: group.groupId,
      label: group.groupName
    }
  ))

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  const removeFile = () => {
    setUploadFile(null)
    setSelectedCert(null)
  }

  function handleSelectCert() {
    const selectedCert = certificateData?.data.find(cert => cert.certificateId.toString() === getValues('certificateId'))
    if (selectedCert) {
      setSelectedCert(selectedCert)
    }
    closeSelectCert()
    openInfoForm()
  }

  useEffect(() => {
    if (signIsSuccess || createSignRequestIsSuccess) {
      closeInfoForm()
      closeSelectCert()
      closeSelectGroup()
      setUploadFile(null)
      setSelectedCert(null)
      reset()
      groupForm.reset()
    }
  }, [signIsSuccess, createSignRequestIsSuccess])

  return (
    <div className="flex gap-4">
    {(signIsLoading || createSignRequestIsLoading) && <Loading />}
    <Form {...form}>
      <form
        id="sign-form"
        className="flex basis-3/5 flex-col justify-between rounded-lg bg-white p-6"
        onSubmit={form.handleSubmit(async values => {
          closeInfoForm()
          if (!uploadFile) return;
          const data = {
            body: {
              signatureLocation: values.signatureLocation,
              signatureReason: values.signatureReason,
              visibleLine1: values.visibleLine1,
              certificateId: parseInt(values.certificateId),
              password: values.password,
            },
            file: uploadFile,
          }
          const response = await mutateSign(data)
          const downloadData = {
            fileId: response.fileId,
            fileName: response.fileName
          }
          downloadFile(downloadData)
        })}
      >
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex h-60 w-full cursor-pointer flex-col gap-3 items-center justify-center  rounded-md bg-secondary-400 text-secondary-700  hover:bg-secondary-500 ">
                      <LuFolderUp className="h-16 w-auto" />
                      <p>Click để chọn tệp</p>
                      <p>Định dạng được hỗ trợ: PDF</p>
                      <p>Kích thước hỗ trợ tối đa 20MB</p>
                </div>
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={event => {
                    const file = event?.target?.files?.[0]
                    const formData = new FormData()
                    if (file) {
                      formData.append('file', file)
                    }
                    if (file && file.size > MAX_FILE_SIZE) {
                      setUploadFileErr(t('validate:file_max_size'))
                      return false
                    }
                    if (file && !ACCEPTED_FILE_TYPES.includes(file.type)) {
                      setUploadFileErr(t('validate:file_type'))
                      return false
                    }
                    if (file) {
                      setUploadFile(file)
                    }
                    console.log(file)
                    event.target.value = ''
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {uploadFile && (
          <div className="mt-4 flex w-full flex-col gap-6">
            <div className="bg-secondary-400 flex items-start justify-between px-4 py-2 rounded-md">
              <p>{uploadFile.name} ({formatBytes(uploadFile.size)})</p>
              <LuTrash
                className="h-4 w-4"
                onClick={removeFile}
              />
            </div>
            <div className="flex items-center justify-center gap-4">
            <Button className="w-fit self-center" onClick={openSelectCert}>
              Kí số
            </Button>
            <Button variant="secondaryLight" className="w-fit" onClick={openSelectGroup}>
              Chọn nhóm
            </Button>
            </div>
          </div>
        )}
        {isOpenSelectCert && (
          <Dialog isOpen={isOpenSelectCert} onClose={closeSelectCert}>
            <div className="inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6 sm:align-middle">
              <div className="absolute -right-3 -top-3">
                <button
                  className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                  onClick={closeSelectCert}
                >
                  <span className="sr-only">Close panel</span>
                  <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-col items-center justify-between mt-3 min-h-96 text-center sm:mt-0 sm:text-left">
                <div className="flex-1">
                  <DialogTitle className="mb-4 text-h1 self-center text-secondary-900">
                    Chọn chứng thư số
                  </DialogTitle>
                  <FormField
                    control={form.control}
                    name="certificateId"
                    render={({ field: {onChange, value, ...field} }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={onChange}
                            defaultValue={value}
                            className="grid grid-cols-2 gap-4"
                          >
                            {certificateData &&
                              certificateData.data.length > 0 &&
                              certificateData.data.map(cert => (
                                <div>
                                  <FormControl>
                                    <div className="p-4 shadow-lg">
                                      <div className="flex items-center justify-between">
                                        <p className="font-semibold">{cert.commonName}</p>
                                        <RadioGroupItem
                                          value={cert.certificateId.toString()}
                                        />
                                      </div>
                                      <div className="mt-4 grid grid-cols-3 gap-2">
                                        <p>Chủ thể: </p>
                                        <p className="col-span-2">{cert.subjectName}</p>
                                        <p>Số series: </p>
                                        <p className="col-span-2">{cert.serialNumber}</p>
                                        <p>
                                          Hiệu lực:
                                          </p>
                                          <p className="col-span-2">
                                          {moment(cert.notValidBefore).format(
                                            'DD/MM/YYYY',
                                          )}{' - '}
                                          {moment(cert.notValidAfter).format(
                                            'DD/MM/YYYY',
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </FormControl>
                                </div>
                              ))}
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4 justify-self-center text-center">
                  <Button className="" onClick={handleSelectCert}>Tiếp tục</Button>
                </div>
              </div>
            </div>
          </Dialog>
        )}

        {isOpenInfoForm && (
          <Dialog isOpen={isOpenInfoForm} onClose={closeInfoForm}>
            <div className="inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6 sm:align-middle">
              <div className="absolute -right-3 -top-3">
                <button
                  className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                  onClick={closeInfoForm}
                >
                  <span className="sr-only">Close panel</span>
                  <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center mt-3 text-center sm:mt-0 sm:text-left">
                <div className="flex w-full flex-col justify-between space-y-6">
                  <DialogTitle className="text-h1 text-secondary-900">
                    Thông tin
                  </DialogTitle>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="signatureLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa điểm kí</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="signatureReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lí do kí</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visibleLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  className="mt-4 self-center"
                  form="sign-form"
                  type="submit"
                >
                  Kí số
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </form>
    </Form>
    <Form {...groupForm}>
        <form id="create-sign-request" onSubmit={groupForm.handleSubmit(async values => {
          if (!uploadFile) return;
          const data = {
            body: {
              groupId: values.group,
              invalidDate: new Date(values.date)
            },
            files: uploadFile,
          }
          console.log(data)
          await mutateCreateSignRequest(data)
        })}>
          {isOpenSelectGroup && (
                      <Dialog isOpen={isOpenSelectGroup} onClose={closeSelectGroup}>
                      <div className="inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6 sm:align-middle">
                        <div className="absolute -right-3 -top-3">
                          <button
                            className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                            onClick={closeSelectGroup}
                          >
                            <span className="sr-only">Close panel</span>
                            <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="flex flex-col items-center justify-center mt-3 text-center sm:mt-0 sm:text-left">
                          <div className="flex w-full flex-col justify-between space-y-6">
                            <DialogTitle className="text-h1 self-center text-secondary-900">
                              {t('sign:group.title')}
                            </DialogTitle>
                            <FormField
                              control={groupForm.control}
                              name="group"
                              render={({ field: {onChange, value, ...field} }) => (
                                <FormItem className="flex gap-4 items-center">
                                  <FormLabel className="basis-1/5">Nhóm</FormLabel>
                                  <FormControl>
                                    <div className="flex-1">
                                    <SelectDropdown 
                                        options={groupOptions}
                                        customOnChange={onChange}
                                        {...field}
                                    />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={groupForm.control}
                              name="date"
                              render={({ field: {value, onChange, ...field} }) => (
                                <FormItem className="flex gap-4 items-center">
                                  <FormLabel className="basis-1/5">Thời hạn ký</FormLabel>
                                  <FormControl>
                                    <div className="flex-1">
                                      <DateTime value={value} onChange={date => onChange(date)}
                                      />
                                      </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex mt-8 items-center justify-center gap-4">
                          <Button
                            form="create-sign-request"
                            type="submit"
                          >
                            Tạo yêu cầu
                          </Button>
                          <Button variant="secondaryLight" onClick={closeSelectGroup}>
                            Huỷ
                          </Button>
                          </div>
                        </div>
                      </div>
                    </Dialog>
          )}
        </form>
    </Form>
    <div className="basis-2/5 rounded-lg bg-white p-6">
        <div className="mb-3">
          <TitleBar title={t('verify:doc_info.title')} className="mb-6" />
          {uploadFile ? (
            <div className="grid grid-cols-3 gap-y-4">
              <p>{t('verify:doc_info.file_name')}</p>
              <p className="col-span-2 w-full">{uploadFile.name}</p>
              <p>{t('verify:doc_info.size')}</p>
              <p className="col-span-2 w-full">{uploadFile.size}</p>
              <p>{t('verify:doc_info.type')}</p>
              <p className="col-span-2 w-full">{uploadFile.type}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              <p>{t('verify:doc_info.file_name')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('verify:doc_info.size')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('verify:doc_info.type')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
            </div>
          )}
        </div>
        <div>
          <TitleBar title={t('verify:cert_info.title')} className="mb-6" />
          {selectedCert ? (
              <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                <p>{t('certificate:name')}</p>
                <p className="col-span-2 h-4 w-full">
                  {selectedCert.commonName}
                </p>
                <p>{t('certificate:subject')}</p>
                <p className="col-span-2 w-full">
                  {selectedCert.subjectName}
                </p>
                <p>{t('certificate:start_date')}</p>
                <p className="col-span-2 w-full">
                  {moment(selectedCert.notValidBefore).format(
                    'DD/MM/yyyy',
                  )}
                </p>
                <p>{t('certificate:end_date')}</p>
                <p className="col-span-2 w-full">
                  {moment(selectedCert.notValidAfter).format(
                    'DD/MM/yyyy',
                  )}
                </p>
              </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              <p>{t('certificate:name')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('certificate:subject')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('certificate:start_date')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('certificate:end_date')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
