const signRequestDetail = {
    fileSize: "62KB",
    fileName: "Duong-Tan-Dung-Java-Dev.pdf",
    registUserName: "Nguyen Van D",
    updateUserName: "Nguyen Van D",
    invalidDate: new Date("2024-06-30T00:49:40.686448"),
    signRequestId: 3,
    registTs: new Date("2024-06-29T21:58:34.795947"),
    updateTs: new Date("2024-06-29T21:58:34.795947"),
    numberOfUser: 4,
    numberOfUserHasSigned: 2,
    fileId: 27,
    isValid: true
}

const userList = [
    {
        userName: "Nguyen Van C",
        certificateFileId: null,
        userEmail: "user3@gmail.com",
        hasSigned: true,
        signTime: "2024-06-29T22:03:00",
        userId: 3
    },
    {
        userName: "Nguyen Van D",
        certificateFileId: null,
        userEmail: "user4@gmail.com",
        hasSigned: true,
        signTime: "2024-06-29T22:02:55",
        userId: 4
    },
    {
        userName: "Nguyen Van E",
        certificateFileId: null,
        userEmail: "user5@gmail.com",
        hasSigned: false,
        signTime: null,
        userId: 5
    },
    {
        userName: "Nguyen Van F",
        certificateFileId: null,
        userEmail: "user6@gmail.com",
        hasSigned: false,
        signTime: null,
        userId: 6
    }
]

export {
    signRequestDetail,
    userList
}