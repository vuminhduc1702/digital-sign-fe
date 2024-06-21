import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/utils/hooks'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuFolderUp, LuTrash } from 'react-icons/lu'
import { type VerifyRes, useVerify } from '../api/verify'
import moment from 'moment'
import TitleBar from '@/components/Head/TitleBar'
import { Skeleton } from '@/components/ui/skeleton'

export function VerifyForm() {
  const { t } = useTranslation()

  const { mutateAsync: mutateVerify } = useVerify()

  const form = useForm()

  const [uploadFile, setUploadFile] = useState<File>()
  const [uploadFileErr, setUploadFileErr] = useState('')
  const [responseData, setResponseData] = useState<VerifyRes[]>([])

  return (
    <div className="flex gap-4">
      <Form {...form}>
        <form
          className="flex basis-3/5 flex-col justify-between rounded-lg bg-white p-6"
          onSubmit={form.handleSubmit(async values => {
            const data = {
              files: uploadFile,
            }
            const response = await mutateVerify(data)
            setResponseData(response)
          })}
        >
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
                      const file = event.target.files[0]
                      const formData = new FormData()
                      formData.append('file', event.target.files[0])
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
              <div className="flex items-start justify-center gap-6">
                <p>{uploadFile.name}</p>
                <p>{uploadFile.size}</p>
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
          <Button
            className="w-fit self-center"
            type="submit"
            disabled={!uploadFile}
          >
            {t('verify:verify')}
          </Button>
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
