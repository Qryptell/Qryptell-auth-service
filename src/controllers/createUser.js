import sql from "../configurations/mysql.js"

export default function createUser(userId, email, username, password) {
    return new Promise((resolve, reject) => {
        const createUserQuery = `INSERT INTO users VALUES("${userId}","${email}","${username}","${password}");`
        sql(createUserQuery).then(() => {
            resolve()
        }).catch(() => {
            reject()
        })
    })
}