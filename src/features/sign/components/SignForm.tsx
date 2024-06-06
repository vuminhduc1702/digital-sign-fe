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

export function SignForm() {
  const { t } = useTranslation()
  const form = useForm()

  const {
    data: certificateData,
    isLoading: certificateIsLoading,
    isSuccess: certificateIsSuccess,
  } = useGetCertificateList({})

  const { mutateAsync: mutateSign, isSuccess: signIsSuccess } = useSign()

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

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [uploadFileErr, setUploadFileErr] = useState('')

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  function handleSelectCert() {
    closeSelectCert()
    openInfoForm()
  }

  useEffect(() => {
    if (signIsSuccess) {
      closeInfoForm()
      closeSelectCert()
      setUploadFile(null)
      form.reset()
    }
  }, [signIsSuccess])

  return (
    <Form {...form}>
      <form
        id="sign-form"
        onSubmit={form.handleSubmit(async values => {
          const data = {
            body: {
              signatureLocation: values.signatureLocation,
              signatureReason: values.signatureReason,
              visibleLine1: values.visibleLine1,
              visibleLine2: values.visibleLine2,
              certificateId: parseInt(values.certificateId),
              password: values.password,
            },
            file: uploadFile,
          }
          console.log(data)
          mutateSign(data)
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
                onClick={() => setUploadFile(null)}
              />
            </div>
            <Button className="w-fit self-center" onClick={openSelectCert}>
              Kí số
            </Button>
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
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <div className="">
                  <DialogTitle className="text-h1 text-secondary-900">
                    Chọn chứng thư số
                  </DialogTitle>
                  <FormField
                    control={form.control}
                    name="certificateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2"
                          >
                            {certificateData &&
                              certificateData.data.length > 0 &&
                              certificateData.data.map(cert => (
                                <div>
                                  <FormControl>
                                    <>
                                      <RadioGroupItem
                                        value={cert.certificateId.toString()}
                                      />
                                      <div>
                                        <p>{cert.commonName}</p>
                                        <p>Chủ thể: {cert.subjectName}</p>
                                        <p>Số series: {cert.serialNumber}</p>
                                        <p>
                                          Hiệu lực:{' '}
                                          {moment(cert.notValidBefore).format(
                                            'DD:mm:yyyy',
                                          )}{' '}
                                          -{' '}
                                          {moment(cert.notValidAfter).format(
                                            'DD:mm:yyyy',
                                          )}
                                        </p>
                                      </div>
                                    </>
                                  </FormControl>
                                </div>
                              ))}
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button onClick={handleSelectCert}>Tiếp tục</Button>
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
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
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
                        <FormLabel>Ghi chú 1</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visibleLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú 2</FormLabel>
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
  )
}
