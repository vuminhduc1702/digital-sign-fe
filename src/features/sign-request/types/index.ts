export type SignRequest = {
    hasSigned: boolean,
    typeName: string,
    fileName: string,
    fileSize: string,
    signRequestId: number,
    registTs: Date,
    numberOfUser: number,
    lastUserUpdate: string,
    lastUpdate: Date
  }