const allowIDs = ['131082004', '298691789']
const noAllowError = `У вас нет доступа!`

export function checkAccess(userID) {
    if (!allowIDs.includes(userID)) {
        throw new Error(noAllowError)
    }
}