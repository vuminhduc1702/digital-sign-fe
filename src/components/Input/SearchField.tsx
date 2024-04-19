import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuSearch, LuX } from 'react-icons/lu'
import { cn } from '@/utils/misc'

type SearchFieldProps = {
  setSearchValue?: React.Dispatch<React.SetStateAction<string>>
  setIsSearchData?: React.Dispatch<React.SetStateAction<boolean>>
  placeholder?: string
  title?: string
  closeSearch?: boolean
}

export function SearchField({
  setSearchValue,
  setIsSearchData,
  placeholder,
  title,
  closeSearch,
}: SearchFieldProps) {
  const { t } = useTranslation()
  const form = useForm({
    defaultValues: {
      searchByName: '',
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={e => {
          setSearchValue && setSearchValue(form.watch('searchByName'))
          setIsSearchData && setIsSearchData(true)
          setTimeout(() => {
            setIsSearchData && setIsSearchData(false)
          }, 1000)
          e.preventDefault()
        }}
      >
        <div className="flex h-full flex-row items-start gap-[14px] lg:items-center lg:gap-[28px]">
          <div className="flex items-center gap-[14px]">
            {title && <div className="hidden text-sm lg:flex">{title}</div>}
            <FormField
              control={form.control}
              name="searchByName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="text"
                        className={cn(
                          'h-[38px] min-w-[250px] px-[12px] py-[8px] text-sm',
                          closeSearch ? 'pr-[36px]' : 'pr-[12px]',
                        )}
                        placeholder={placeholder ?? t('search:title')}
                        endIcon={
                          closeSearch &&
                          form.watch('searchByName').length > 0 ? (
                            <LuX
                              className="absolute right-[12px] top-[25%] h-[50%] cursor-pointer"
                              onClick={() => {
                                form.setValue('searchByName', '')
                                setSearchValue && setSearchValue('')
                              }}
                            />
                          ) : undefined
                        }
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="h-[38px] w-[50px] bg-[#DBDADE]"
            // onClick={() => {
            // }}
          >
            <LuSearch className="h-5 w-5 text-[#4B465C]" />
          </Button>
        </div>
      </form>
    </Form>
  )
}

// import { InputField } from '../Form'
// import { SearchIcon } from '../SVGIcons'
// import { HiOutlineXMark } from 'react-icons/hi2'
// import { useTranslation } from 'react-i18next'

// export function SearchField({
//   searchQuery,
//   setSearchQuery,
// }: {
//   searchQuery: string
//   setSearchQuery: (value: string) => void
// }) {
//   const { t } = useTranslation()

//   return (
//     <InputField
//       type="text"
//       placeholder={t('table:search')}
//       value={searchQuery}
//       onChange={e => {
//         const value = e.target.value
//         setSearchQuery(value)
//       }}
//       endIcon={
//         <div className="absolute right-2 top-1/2 flex -translate-y-1/2 transform justify-center">
//           {searchQuery.length > 0 && (
//             <HiOutlineXMark
//               className="align-center mr-[5px] flex h-4 w-4 transform cursor-pointer justify-center opacity-50"
//               onClick={() => setSearchQuery('')}
//             />
//           )}
//           <SearchIcon
//             className="align-center flex cursor-pointer justify-between"
//             width={16}
//             height={16}
//             viewBox="0 0 16 16"
//           />
//         </div>
//       }
//     />
//   )
// }
