import { InputField } from '../Form'
import { SearchIcon } from '../SVGIcons'
import { HiOutlineXMark } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'

export function SearchField({
  searchQuery,
  setSearchQuery,
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
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 transform justify-center">
          {searchQuery.length > 0 && (
            <HiOutlineXMark
              className="align-center mr-[5px] flex size-[16px] transform cursor-pointer justify-center opacity-50"
              onClick={() => setSearchQuery('')}
            />
          )}
          <SearchIcon
            className="align-center flex cursor-pointer justify-between"
            width={16}
            height={16}
            viewBox="0 0 16 16"
          />
        </div>
      }
    />
  )
}
