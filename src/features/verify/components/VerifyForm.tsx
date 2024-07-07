import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, useDisclosure } from '@/utils/hooks'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuFolderUp, LuTrash } from 'react-icons/lu'
import { type VerifyRes, useVerify } from '../api/verify'
import moment from 'moment'
import TitleBar from '@/components/Head/TitleBar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBytes } from '@/utils/transformFunc'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { HiOutlineXMark } from 'react-icons/hi2'
import { EyeHide, EyeShow } from '@/components/SVGIcons'
import btnRemoveIcon from '@/assets/icons/btn-remove.svg'
import { useVerifyGroup } from '../api/verifyGroup'

export function VerifyForm() {
  const { t } = useTranslation()

  const { mutateAsync: mutateVerify } = useVerify()


  const {mutateAsync: mutateVerifyGroup} = useVerifyGroup()

  const {
    close: closeSelectOriginalFile,
    isOpen: isOpenSelectOriginalFile,
    open: openSelectOriginalFile
  } = useDisclosure()

  const form = useForm()

  const groupForm = useForm()

  const fileRef = groupForm.register('original')


  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [uploadFileErr, setUploadFileErr] = useState('')
  const [responseData, setResponseData] = useState<VerifyRes[]>([])

  return (
    <div className="flex gap-4">
      <Form {...form}>
        <form
          className="flex basis-3/5 flex-col justify-between rounded-lg bg-white p-6"
          onSubmit={form.handleSubmit(async values => {
            if (!uploadFile) return;
            const data = {
              files: uploadFile,
            }
            const response = await mutateVerify(data)
            setResponseData(response)
          })}
        >
          <div>
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex h-60 w-full cursor-pointer  flex-col items-center justify-center  rounded-md bg-secondary-400 text-secondary-700  hover:bg-secondary-500 ">
                    <LuFolderUp className="h-16 w-auto" />
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
                  onClick={() => {
                    setUploadFile(null)
                    setResponseData([])
                  }}
                />
              </div>
            </div>
          )}
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondaryLight"
              className="w-fit self-center"
              type="submit"
              disabled={!uploadFile}
            >
              {t('verify:verify')}
            </Button>
            <Button 
              variant="secondaryLight"
              onClick={openSelectOriginalFile}
              className="w-fit self-center"
              disabled={!uploadFile}
            >
              Kiểm tra chữ ký nhóm
            </Button>
          </div>
        </form>
      </Form>
      {isOpenSelectOriginalFile && 
          <Dialog isOpen={isOpenSelectOriginalFile} onClose={closeSelectOriginalFile}>
          <div className="inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6 sm:align-middle">
            <div className="absolute -right-3 -top-3">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={closeSelectOriginalFile}
              >
                <span className="sr-only">Close panel</span>
                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center mt-3 text-center sm:mt-0 sm:text-left">
              <div className="flex w-full flex-col justify-between space-y-6">
                <DialogTitle className="text-h1 text-secondary-900">
                  Chọn tệp gốc
                </DialogTitle>
                <Form {...groupForm}>
                  <form id="group-form" onSubmit={groupForm.handleSubmit(async values => {
                    closeSelectOriginalFile()
                    if (!uploadFile || !originalFile) return;
                    const data = {
                      signedFile: uploadFile,
                      originalFile: originalFile
                    }

                    await mutateVerifyGroup(data)
                  })}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chọn tệp gốc:</FormLabel>
                     <div className="mb-1 mt-2 flex items-center justify-between">
                      <div className="relative mr-4 flex-1">
                        <Input 
                          disabled
                          value={originalFile ? originalFile.name : ''}
                          className="h-9 w-full disabled:cursor-auto disabled:bg-white"
                          placeholder='Chọn tệp'
                          endIcon={
                            originalFile ? (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 transform pl-4">
                                <img 
                                  height={12}
                                  width={12}
                                  src={btnRemoveIcon}
                                  className="cursor-pointer text-secondary-700"
                                  onClick={() => setOriginalFile(null)}
                                  alt="Original"
                                />
                              </div>
                            ) : <div></div>
                          }
                        />
                      </div>
                      <FormField 
                        control={groupForm.control}
                        name="original"
                        render={({field}) => (
                          <FormItem className="space-y-0">
                            <FormLabel className="flex h-9 w-fit cursor-pointer items-center justify-center gap-x-2 rounded-md border bg-primary-200 px-5 py-2 font-medium text-primary-400 shadow-sm hover:opacity-80">
                                Tải lên
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input 
                                  type="file"
                                  className="mt-2 border-none p-2 shadow-none"
                                  {...groupForm.register('original')}
                                  {...fileRef}
                                  onChange={event => {
                                    if (event.target.files && event.target) {
                                      const file = event.target.files[0]
                                      setOriginalFile(file)
                                      event.target.value = ''
                                    }
                                  }}
                                />
                              </FormControl>
                            </div>
                          </FormItem>
                        )}
                      />
                     </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </form>
                </Form>
              </div>
              <Button
                className="mt-4 self-center"
                form="group-form"
                type="submit"
              >
                Kiểm tra
              </Button>
            </div>
          </div>
        </Dialog>
          }
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
          {uploadFile && responseData && responseData.length > 0 ? (
            responseData.map(res => (
              <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                <p>{t('verify:cert_info.sign_date')}</p>
                <p className="col-span-2 h-4 w-full">
                  {moment(res.signDate).format('DD/MM/yyyy')}
                </p>
                <p>{t('verify:cert_info.name')}</p>
                <p className="col-span-2 w-full">{res.name}</p>
                <p>{t('verify:cert_info.self_signed')}</p>
                <p className="col-span-2 w-full">
                  {res.selfSigned === true ? 'Có' : 'Không'}
                </p>
                <p>{t('verify:cert_info.status')}</p>
                <p className="col-span-2 w-full">
                  {res.signatureVerified === 'YES'
                    ? t('verify:cert_info.valid')
                    : t('verify:cert_info.invalid')}
                </p>
                <p>{t('verify:cert_info.serial')}</p>
                <p className="col-span-2 w-full">
                  {res.certificateInfo.serial}
                </p>
                <p>{t('verify:cert_info.start_date')}</p>
                <p className="col-span-2 w-full">
                  {moment(res.certificateInfo.notValidBefore).format(
                    'DD/MM/yyyy',
                  )}
                </p>
                <p>{t('verify:cert_info.end_date')}</p>
                <p className="col-span-2 w-full">
                  {moment(res.certificateInfo.notValidAfter).format(
                    'DD/MM/yyyy',
                  )}
                </p>
                <p>{t('verify:cert_info.algo')}</p>
                <p className="col-span-2 w-full">
                  {res.certificateInfo.signAlgorithm}
                </p>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              <p>{t('verify:cert_info.sign_date')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('verify:cert_info.name')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('verify:cert_info.self_signed')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('verify:cert_info.status')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('verify:cert_info.serial')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('verify:cert_info.start_date')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('verify:cert_info.end_date')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
              <p>{t('verify:cert_info.algo')}</p>
              <Skeleton className="col-span-2 h-4 w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
