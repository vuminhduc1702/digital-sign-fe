export type Certificate = {
  typeName: string
  state: string
  version: string
  certificateId: number
  certificateFileId: number
  commonName: string
  serialNumber: string
  countryAndRegion: string
  locality: string
  signAlgorithm: string
  notValidBefore: Date
  notValidAfter: Date
  subjectName: string
  statusName: string
  issuerName: string
}
