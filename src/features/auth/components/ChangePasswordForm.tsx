import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'

import {
  useChangePassword,
  ChangePaswordSchema,
  type changePasswordDTO,
} from '../api/changepassword'

import { BtnPasswordLoginIcon, EyeHide, EyeShow } from '@/components/SVGIcons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

type ChangePaswordFormProps = {
  onSuccess: () => void
}

export const ChangePaswordForm = ({ onSuccess }: ChangePaswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(prev => !prev)
  }
  const toggleRePasswordVisibility = () => {
    setShowRePassword(prev => !prev)
  }
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }
  const { t } = useTranslation()

  const changePasswordMutation = useChangePassword()
  const form = useForm<changePasswordDTO['data']>({
    resolver: ChangePaswordSchema && zodResolver(ChangePaswordSchema),
    shouldUnregister: true,
    defaultValues: {
      new_password: '',
      new_password_confirm: '',
      old_password: '',
    },
  })
  const { handleSubmit } = form
  return (
    <Form {...form}>
      <form
        className="w-full space-y-6"
        onSubmit={handleSubmit(async values => {
          await changePasswordMutation.mutateAsync(values)
          onSuccess()
        })}
      >
        <>
          <FormField
            control={form.control}
            name="old_password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder={t('auth:require_password_old')}
                    className="bg-stone-300"
                    autoComplete="off"
                    startIcon={
                      <BtnPasswordLoginIcon
                        height={20}
                        width={20}
                        viewBox="0 0 20 20"
                        className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                      />
                    }
                    endIcon={
                      showOldPassword ? (
                        <EyeShow
                          height={24}
                          width={24}
                          viewBox="0 0 24 24"
                          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
                          onClick={toggleOldPasswordVisibility}
                        />
                      ) : (
                        <EyeHide
                          height={24}
                          width={24}
                          viewBox="0 0 24 24"
                          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
                          onClick={toggleOldPasswordVisibility}
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
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth:require_password_new')}
                    className="bg-stone-300"
                    autoComplete="new-password"
                    startIcon={
                      <BtnPasswordLoginIcon
                        height={20}
                        width={20}
                        viewBox="0 0 20 20"
                        className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                      />
                    }
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
            name="new_password_confirm"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type={showRePassword ? 'text' : 'password'}
                    placeholder={t('auth:confirm_password')}
                    className="bg-stone-300"
                    autoComplete="new-password"
                    startIcon={
                      <BtnPasswordLoginIcon
                        height={20}
                        width={20}
                        viewBox="0 0 20 20"
                        className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                      />
                    }
                    endIcon={
                      showRePassword ? (
                        <EyeShow
                          height={24}
                          width={24}
                          viewBox="0 0 24 24"
                          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
                          onClick={toggleRePasswordVisibility}
                        />
                      ) : (
                        <EyeHide
                          height={24}
                          width={24}
                          viewBox="0 0 24 24"
                          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
                          onClick={toggleRePasswordVisibility}
                        />
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="container mx-auto text-center text-body-xs">
            <Button
              isLoading={changePasswordMutation.isLoading}
              type="submit"
              className="w-full bg-primary-400"
            >
              {t('btn:confirm')}
            </Button>
          </div>
        </>
      </form>
    </Form>
  )
}
