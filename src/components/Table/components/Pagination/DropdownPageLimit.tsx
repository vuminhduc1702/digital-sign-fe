import { useTranslation } from 'react-i18next'

const PAGE_SIZE_LIMIT = [10, 20, 50, 100]

export default function PageSizeLimit({
  setPageSize,
}: {
  setPageSize: React.Dispatch<React.SetStateAction<number>>
}) {
  const { t } = useTranslation()

  function handlePageLimitSelection(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setPageSize(Number(event?.target.value))
  }

  return (
    <div className="text-body-light">
      <span>{t('table:result_limit')}</span>
      <select name="pageLimit" onChange={handlePageLimitSelection}
        className="outline-none"
      >
        {PAGE_SIZE_LIMIT.map((item, index) => {
          return (
            <option value={item} key={index}>
              {item}
            </option>
          )
        })}
      </select>
    </div>
  )
}
