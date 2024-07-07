export type Group = {
    groupId: number,
    groupName: string,
    registTs: Date,
    certificateFileId: number,
    numMember: number,
    ownerName: string,
    joinDate: Date
}

export type GroupUser = {
    userEmail: string,
    phoneNumber: string,
    userName: string,
    joinDate: Date
}