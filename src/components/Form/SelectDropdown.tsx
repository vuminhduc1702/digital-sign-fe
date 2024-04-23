import Select, { type Props, type GroupBase } from 'react-select'
import { useTranslation } from 'react-i18next'
import { Controller, type FieldValues } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { cn } from '@/utils/misc'

import { type SelectOption } from './SelectField'
import { type ControllerPassThroughProps } from '@/types'

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
  customOnChange?: (e?: any) => void
  customSelect?: (e?: any) => void
  handleClearSelectDropdown?: () => void
  handleChangeSelect?: () => void
  refSelect?: any
  icon?: React.ReactElement
  isWrappedArray?: boolean
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues> &
  Props<Option, IsMulti, Group>

export function SelectDropdown<
  TFormValues extends FieldValues,
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  // name,
  // control,
  // label,
  error,
  classlabel,
  classchild,
  classnamefieldwrapper,
  placeholder,
  icon,
  isMulti,
  customOnChange,
  customSelect,
  handleClearSelectDropdown,
  handleChangeSelect,
  isWrappedArray,
  refSelect,
  ...props
}: SelectProps<TFormValues, Option, IsMulti, Group>) {
  const { t } = useTranslation()

  return (
    <Select
      // {...field}
      isMulti={isMulti}
      className={cn('', classnamefieldwrapper)}
      ref={refSelect}
      isSearchable
      isClearable
      placeholder={placeholder ?? t('placeholder:select')}
      onChange={(e, { action }) => {
        const option =
          (e as unknown as SelectOption[])?.length > 0
            ? (e as unknown as SelectOption[]).map(item => {
                return item.value
              })
            : isWrappedArray
              ? [(e as unknown as SelectOption)?.value]
              : (e as unknown as SelectOption)?.value
        customOnChange?.(option)
        customSelect?.(e)
        if (action === 'clear') {
          handleClearSelectDropdown?.()
        }
        if (action === 'remove-value') {
          if ((e as unknown as SelectOption[])?.length === 0) {
            handleClearSelectDropdown?.()
          }
        }
        if (action === 'select-option') {
          handleChangeSelect?.()
        }
      }}
      styles={{
        control: (baseStyles, state) => {
          const isErr = error != null || (error != null && state.isFocused)
          return {
            ...baseStyles,
            borderColor: isErr ? 'red' : '',
            boxShadow: isErr ? 'red' : '',
            ':hover': {
              borderColor: isErr ? 'red' : '',
              boxShadow: isErr ? '0 0 0 1px red' : '0 0 0 1px #2684FF',
            },
          }
        },
      }}
      {...props}
    />
  )
}
