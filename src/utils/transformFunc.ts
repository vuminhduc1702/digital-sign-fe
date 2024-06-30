const uppercaseTheFirstLetter = (str: string) => {
  let lowercase = str.toLowerCase()
  lowercase = lowercase.charAt(0).toUpperCase() + lowercase.slice(1)
  return lowercase
}

const createExportHeaders = (arr: string[]) => {
  const result = []
  for (let i = 0; i < arr.length; i += 1) {
    result.push({
      id: arr[i],
      name: arr[i],
      prompt: arr[i],
      width: 65,
      align: 'center',
      padding: 0,
    })
  }
  return result
}
const convertEpochToDate = (timestamp: number) => {
  if (timestamp) {
    const date = new Date(timestamp * 1000)
    const formattedDate =
      ('0' + date.getHours()).slice(-2) +
      ':' +
      ('0' + date.getMinutes()).slice(-2) +
      ' ' +
      ('0' + date.getDate()).slice(-2) +
      '/' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '/' +
      date.getFullYear()
    return formattedDate
  }
  return ''
}

const convertType = (str: string) => {
  switch (str) {
    case 'STR':
      return 'String'
    case 'BOOL':
      return 'Boolean'
    case 'LONG':
      return 'Long'
    case 'DBL':
      return 'Double'
    case 'JSON':
      return 'JSON'
    default:
      return ''
  }
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0B'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export {
  uppercaseTheFirstLetter,
  createExportHeaders,
  convertEpochToDate,
  convertType,
  formatBytes
}
