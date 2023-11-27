import Select, { type Props, type GroupBase } from 'react-select'
import { useTranslation } from 'react-i18next'
import { Controller, type FieldValues } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { cn } from '~/utils/misc'

import { type SelectOption } from './SelectField'
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
  customOnChange?: (e?: any) => void
  handleClearSelectDropdown?: () => void
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
  name,
  control,
  label,
  error,
  classlabel,
  classchild,
  classnamefieldwrapper,
  placeholder,
  icon,
  isMulti,
  customOnChange,
  handleClearSelectDropdown,
  isWrappedArray,
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
      <div className="flex justify-between gap-x-2">
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value, ...field } }) => {
            return (
              <Select
                {...field}
                {...props}
                isMulti={isMulti}
                className="w-full"
                isSearchable
                isClearable
                placeholder={placeholder ?? t('placeholder:select')}
                onChange={(e, { action }) => {
                  if (action === 'clear' || action === 'remove-value') {
                    handleClearSelectDropdown?.()
                  }
                  const option =
                    (e as unknown as SelectOption[])?.length > 0
                      ? (e as unknown as SelectOption[]).map(item => {
                          return item.value
                        })
                      : isWrappedArray
                      ? [(e as unknown as SelectOption)?.value]
                      : (e as unknown as SelectOption)?.value
                  // console.log('option', option)
                  onChange(option)
                  customOnChange?.(option)
                }}
                // styles={{
                //   control: (baseStyles, state) => ({
                //     ...baseStyles,
                //     borderColor: state.isFocused ? 'grey' : 'red',
                //   }),
                // }}
              />
            )
          }}
        />
        {icon}
      </div>
    </FieldWrapper>
  )
}
