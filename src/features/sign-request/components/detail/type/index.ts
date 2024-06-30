export type SignRequestDetailType = {
    fileSize: string,
    fileName: string,
    registUserName: string,
    updateUserName: string,
    invalidDate: Date,
    signRequestId: number,
    registTs: Date,
    updateTs: Date,
    numberOfUser: number,
    numberOfUserHasSigned: number,
    fileId: number,
    isValid: boolean
}

export type UserDetail = {
    userName: string,
    certificateFileId?: number,
    userEmail: string,
    hasSigned: boolean,
    signTime: Date,
    userId: number
}