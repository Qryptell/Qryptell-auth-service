import sql from "../configurations/mysql.js";

export default function removeJunkTempUsers(){
    const removeJunkTempUsersQuery = `DELETE FROM temporary_users WHERE ${Date.now()} - time > ${process.env.TEMP_USER_EXPIRY_TIME}`
    sql(removeJunkTempUsersQuery)
}