import sql from "../configurations/mysql.js"

export default function createUser(userId, email, userName, password) {
    return new Promise((resolve, reject) => {
        const createUserQuery = `INSERT INTO users VALUES("${userId}","${email}","${userName}","${password}");`
        sql(createUserQuery).then(() => {
            resolve()
        }).catch(() => {
            reject()
        })
    })
}