import sql from "../configurations/mysql.js";

export default function createSession(user_id, refresh_token, session_id) {
    console.log(user_id, refresh_token, session_id);
    return new Promise((resolve, reject) => {
        const createSessionQuery = `INSERT INTO auth VALUES("${session_id}","${refresh_token}","${user_id}")`
        sql(createSessionQuery).then(() => {
            resolve()
        }).catch((e) => {
            throw e
            reject()
        })
    })
}
