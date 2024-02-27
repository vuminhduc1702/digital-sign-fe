import { InputField } from "../Form"
import { SearchIcon } from "../SVGIcons"
import { XMarkIcon } from '@heroicons/react/20/solid'
import { useTranslation } from 'react-i18next'

export function SearchField({
    searchQuery,
    setSearchQuery
}: {
    searchQuery: string
    setSearchQuery: (value: string) => void

}) {
    const { t } = useTranslation()

    return (
      <InputField
        type="text"
        placeholder={t('table:search')}
        value={searchQuery}
        onChange={e => {
          const value = e.target.value
          setSearchQuery(value)
        }}
        endIcon={
          <div className="absolute top-1/2 right-2 -translate-y-1/2 transform flex justify-center">
            {searchQuery.length > 0 && (
              <XMarkIcon
                className="h-[16px] w-[16px] mr-[5px] transform cursor-pointer opacity-50 flex align-center justify-center cursor-pointer"
                onClick={() => setSearchQuery('')}
              />
            )}
            <SearchIcon
              className="cursor-pointer flex justify-between align-center"
              width={16}
              height={16}
              viewBox="0 0 16 16"
            />
          </div>
        }
      />
    )
}