import Select, { type Props, type GroupBase } from 'react-select'
import { useTranslation } from 'react-i18next'
import { Controller, type FieldValues } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { cn } from '~/utils/misc'

import { type ControllerPassThroughProps } from '~/types'

type SelectProps<
  TFormValues extends FieldValues,
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = {
  placeholder?: string
  classlabel?: string
  classchild?: string
  classnamefieldwrapper?: string
  onChange?: (e: any) => void
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues> &
  Props<Option, IsMulti, Group>

export function SelectDropdown<
  TFormValues extends FieldValues,
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  name,
  control,
  label,
  error,
  classlabel,
  classchild,
  classnamefieldwrapper,
  placeholder,
  ...props
}: SelectProps<TFormValues, Option, IsMulti, Group>) {
  const { t } = useTranslation()

  return (
    <FieldWrapper
      classlabel={classlabel}
      classchild={classchild}
      className={cn('', classnamefieldwrapper)}
      label={label}
      error={error}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          return (
            <Select
              {...field}
              {...props}
              isSearchable
              placeholder={placeholder ?? t('placeholder:select')}
            />
          )
        }}
      />
    </FieldWrapper>
  )
}
