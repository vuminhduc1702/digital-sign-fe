import { useEffect, useState } from "react"
import { Project } from "../routes/ProjectManage"
import { flattenData } from "~/utils/misc"
import { ComboBoxBase, filteredComboboxData } from "~/components/ComboBox"
import { useProjects } from "../api"
import { SearchIcon } from "~/components/SVGIcons"

export function ComboBoxSelectProject({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Project[]>>
}) {
  const [query, setQuery] = useState('')

  const { data } = useProjects()

  const { acc: projectFlattenData, extractedPropertyKeys } = flattenData(
    data?.projects,
    [
      'id',
      'name',
      'image',
      'description',
      'app_key',
      'app_secret',
      'sms_config'
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    projectFlattenData,
    extractedPropertyKeys,
  )
  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, data])

  return (
    <ComboBoxBase
      data={filteredData}
      extractedPropertyKeys={extractedPropertyKeys}
      query={query}
      setQuery={setQuery}
      setFilteredComboboxData={setFilteredComboboxData}
      startIcon={<SearchIcon width={16} height={16} viewBox="0 0 16 16" />}
      {...props}
    />
  )
}