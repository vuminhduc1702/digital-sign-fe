export type CertificateRequest = {
    requestId: number
    userEmail: string
    registTs: Date
    updateTs: Date
    isValid: boolean
    actionId: number,
    actionDesc: string,
    ownerId: number,
    ownerFullName: string,
    updateFullName: string
}