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

export function VerifyForm() {
  const { t } = useTranslation()

  const { mutateAsync: mutateVerify } = useVerify()

  const form = useForm()

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadFileErr, setUploadFileErr] = useState('')
  const [responseData, setResponseData] = useState<VerifyRes[]>([])

  return (
    <div className="flex">
      <Form {...form}>
        <form
          className="basis-2/3"
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
                  <div className="flex h-60 w-1/2 cursor-pointer  flex-col items-center justify-center  rounded-md bg-secondary-400 text-secondary-700  hover:bg-secondary-500 ">
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
            <div className="mt-4 flex w-1/2 flex-col gap-6">
              <div className="flex items-center justify-center gap-6">
                <p>{uploadFile.name}</p>
                <p>{uploadFile.size}</p>
                <LuTrash
                  className="h-8 w-8"
                  onClick={() => {
                    setUploadFile(null)
                    setResponseData([])
                  }}
                />
              </div>
              <Button className="w-fit self-center" type="submit">
                Kiểm tra chữ ký
              </Button>
            </div>
          )}
        </form>
      </Form>
      {uploadFile &&
        responseData &&
        responseData.length > 0 &&
        responseData.map(res => (
          <div className="basis-1/3">
            <p>Ngày ký: {moment(res.signDate).format('DD/MM/yyyy')}</p>
            <p>Tên: {res.name}</p>
            <p>Chứng chỉ tự ký: {res.selfSigned === true ? 'Có' : 'Không'}</p>
            <p>
              Chữ ký hợp lệ: {res.signatureVerified === 'YES' ? 'Có' : 'Không'}
            </p>
            <p>Số Serial: {res.certificateInfo.serial}</p>
            <p>
              Ngày hiệu lực:{' '}
              {moment(res.certificateInfo.notValidBefore).format('DD/MM/yyyy')}
            </p>
            <p>
              Ngày hết hạn:{' '}
              {moment(res.certificateInfo.notValidAfter).format('DD/MM/yyyy')}
            </p>
            <p>Hàm ký: {res.certificateInfo.signAlgorithm}</p>
          </div>
        ))}
    </div>
  )
}
