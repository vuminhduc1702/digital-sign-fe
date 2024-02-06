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

export { uppercaseTheFirstLetter, createExportHeaders, convertEpochToDate }
