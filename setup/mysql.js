import mysql from 'mysql2'
import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config()
export var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: 'root',
    password: '1@2@Aban',
    database: 'lunarloom_auth'
});

connection.connect((e) => { e ? console.log(e) : console.log(chalk.yellowBright("Database Connected : MySQL")) })

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
