import Select, { type Props, type GroupBase } from 'react-select'
import { useTranslation } from 'react-i18next'

import { useFormField } from '../ui/form'
import { cn } from '@/utils/misc'

import { type SelectOption } from './SelectField'

type SelectProps<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = {
  placeholder?: string
  classname?: string
  customOnChange?: (e?: any) => void
  handleClearSelectDropdown?: () => void
  handleChangeSelect?: () => void
  refSelect?: any
  icon?: React.ReactElement
  isWrappedArray?: boolean
} & Props<Option, IsMulti, Group>

export function NewSelectDropdown<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  classname,
  placeholder,
  icon,
  isMulti,
  customOnChange,
  handleClearSelectDropdown,
  handleChangeSelect,
  isWrappedArray,
  refSelect,
  ...props
}: SelectProps<Option, IsMulti, Group>) {
  const { t } = useTranslation()
  const { error } = useFormField()

  return (
    <Select
      isMulti={isMulti}
      className={cn('h-9', classname)}
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
            height: '36px',
            borderRadius: '6px',
            borderColor: isErr ? 'red' : '#b4b5b6',
            boxShadow: isErr ? 'red' : '',
            ':hover': {
              borderColor: isErr ? 'red' : '#2684FF',
              boxShadow: isErr ? '0 0 0 1px red' : '0 0 0 1px #2684FF',
            },
          }
        },
      }}
      {...props}
    />
  )
}
