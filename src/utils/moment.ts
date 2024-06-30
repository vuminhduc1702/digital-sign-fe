import moment from "moment"

const convertDate = (date: Date) => {
    return moment(date).format('HH:mm:ss DD/MM/YYYY')
}

export {
    convertDate
}