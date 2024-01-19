import sql from "../configurations/mysql.js";

export default function removeJunkTempUsers(){
    const FIVE_MINUTE = 60 * 5;
    const removeJunkTempUsersQuery = `DELETE FROM temporary_users WHERE ${Date.now()} - time > ${FIVE_MINUTE}`
    sql(removeJunkTempUsersQuery)
}
