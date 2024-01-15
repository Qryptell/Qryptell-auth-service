import mysql from 'mysql2'

export var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: "root",
    password: "1@2@Aban",
    database: 'lunarloom_auth'
});


const sql = (query) => {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, row) => {
            if (err) {
                reject(err)
            } else {
                resolve(row)
            }
        })
    })
}

export default sql