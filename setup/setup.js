import sql, { connection } from "./mysql.js";
import chalk from "chalk";

// creating users table
let success = 0
await sql("CREATE TABLE users (_id varchar(100) NOT NULL,email varchar(255) NOT NULL,username varchar(500) NOT NULL,password varchar(1000) NOT NULL,PRIMARY KEY (_id),UNIQUE KEY email_unique (email),UNIQUE KEY username_unique (username));")
    .then(() => {
        console.log(chalk.greenBright("1 - users table created"));
        success++
    })
    .catch((e) => {
        console.log(chalk.red(e));
    })

// creating auth table

await sql("CREATE TABLE auth (session_id varchar(100) NOT NULL PRIMARY KEY,refresh_token varchar(100) NOT NULL,user_id varchar(100) NOT NULL);")
    .then(() => {
        console.log(chalk.greenBright("2 - auth table created"));
        success++
    })
    .catch((e) => {
        console.log(chalk.red(e));
    })

// creating auth table

await sql("CREATE TABLE temporary_users(email varchar(300) NOT NULL PRIMARY KEY, otp varchar(200) NOT NULL, user_name varchar(500) NOT NULL UNIQUE,name varchar(1000) NOT NULL, password varchar(1000) NOT NULL, time decimal(18, 0) NOT NULL);")
    .then(() => {
        console.log(chalk.greenBright("3 - temporary_users table created"));
        success++
    })
    .catch((e) => {
        console.log(chalk.red(e));
    })

if (success === 3) {
    console.log(chalk.bgGreen("All setup  completed"));
} else {
    console.log(chalk.bgGreen("only " + success + " setup  completed"));
}
connection.end()
