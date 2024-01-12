import sql from "../configurations/mysql.js";

export default function updateSession(refresh_token,session_id) {
    console.log(refresh_token, session_id);
    return new Promise((resolve, reject) => {
        const updateSessionQuery = `UPDATE auth SET refresh_token="${refresh_token}" WHERE session_id="${session_id}"`
        sql(updateSessionQuery).then(() => {
            resolve()
        }).catch(() => {
            reject()
        })
    })
}