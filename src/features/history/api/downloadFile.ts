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
    link.setAttribute("download", fileName)
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}