import MapComponent from '../components/MapComponent'
import { useEffect, useState } from 'react'
import { useGetMapInfo } from '../api'

export default function TestMap() {
  const [projectId, setProjectId] = useState<string>(
    '293428b5-21f8-423d-9966-e34c14ba6364',
  )
  const [offset, setOffset] = useState<number>(0)

  const { data, isPreviousData, isSuccess } = useGetMapInfo({
    id: projectId,
    offset: offset,
  })

  useEffect(() => {}, [])

  return (
    <>
      <MapComponent data={data?.devices || []} type="test" />
    </>
  )
}
