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

export { uppercaseTheFirstLetter, createExportHeaders }
