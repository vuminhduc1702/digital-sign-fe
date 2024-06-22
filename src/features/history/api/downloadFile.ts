import { axios } from "@/lib/axios"

type DownloadProps = {
    fileName: string
    fileId: number
}

export const downloadFile = async ({fileName, fileId}: DownloadProps) => {
    const response = await axios.get(`/api/download/${fileId}`)
    const blob = new Blob([response.data])
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}