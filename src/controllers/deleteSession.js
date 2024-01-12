import sql from "../configurations/mysql.js"

export default function deleteSession(session_id) {
    return new Promise((resolve, reject) => {
        const deleteUserQuery = `DELETE FROM auth WHERE session_id="${session_id}";`
        sql(deleteUserQuery).then(() => {
            resolve()
        }).catch(() => {
            reject()
        })
    })
}