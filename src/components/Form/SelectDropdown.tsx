import Select, { type PropsValue } from 'react-select'
import { useTranslation } from 'react-i18next'
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { type SelectOption } from './SelectField'

export type ControllerPassThroughProps<TFormValues extends FieldValues> = {
  name: Path<TFormValues>
  control?: Control<TFormValues, any>
}

type SelectProps<TFormValues extends FieldValues> = {
  options: SelectOption[]
  onChange?: (e: any) => void
  value?: PropsValue<SelectOption>
  closeMenuOnSelect?: boolean
  isMulti?: boolean
  onMenuClose?: () => void
  onMenuOpen?: () => void
  isOptionDisabled?: (option: SelectOption) => boolean
  noOptionsMessage?: () => string
  defaultValue?: PropsValue<SelectOption> | undefined
  placeholder?: string
  inputId?: string
  isClearable: boolean
  maxMenuHeight?: number
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues>

export function SelectDropdown<TFormValues extends FieldValues>({
  options,
  name,
  control,
  label,
  error,
  inputId,
  isClearable,
  ...props
}: SelectProps<TFormValues>) {
  const { t } = useTranslation()

  return (
    <FieldWrapper label={label} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          return (
            <Select
              {...field}
              isSearchable
              isClearable={isClearable}
              placeholder={t('placeholder:general')}
              options={options}
              {...props}
            />
          )
        }}
      />
    </FieldWrapper>
  )
}
