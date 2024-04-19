import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Table } from '@tanstack/react-table'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
}

export function DropdownPageLimit<TData>({
  table,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
      <div className="flex items-center space-x-2">
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={value => {
            table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map(pageSize => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
