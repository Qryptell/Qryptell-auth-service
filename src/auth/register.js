import bcrypt from 'bcrypt'
import sql from '../configurations/mysql.js'
import { emailChannel, queue } from '../configurations/rabbitmq.js'
import removeJunkTempUsers from '../controllers/removeJunkTempUsers.js'


const register = async (req, res) => {

    const FIVE_MINUTE = 60*5*1000;
    const { email, password, username ,name } = req.body
    console.log(email, password, username ,name)

    if (!(email && password && username && name)) {
        return res.status(401).json({ success: false, message: "Missing Crendential" })
    }

    // password encrypting with bcrypt
    const encrypedPassword = await bcrypt.hash(password, 12)
    const otp = Math.floor(Math.random() * (999999 - 100000) + 100000)
    console.log(otp)
    const encrypedOtp = await bcrypt.hash(`${otp}`, 12)

    //declaring all needed sql queries

    const storeTemporaryUsersQuery = `INSERT INTO temporary_users VALUES("${email}","${encrypedOtp}","${username}","${name}","${encrypedPassword}","${Date.now()}");`
    const findUserWithEmailQuery = `SELECT * FROM users WHERE email="${email}";`
    const findUserWithusernameQuery = `SELECT * FROM users WHERE username="${username}";`

    //check availability of email
    sql(findUserWithEmailQuery).then((row0) => {
        if (row0.length < 1) {
            //check availabilty of username
            sql(findUserWithusernameQuery).then((row1) => {
                if (row1.length < 1) {
                    // const userInTempUsers = await checkUserInTempUser(email,username)
                    checkUserInTempUser(email,username).then((response) => {
                        console.log("hello")
                        if (!response) {
                            sql(storeTemporaryUsersQuery).then(() => {
                                console.log("created temporary user");
                                sendOtp(email, otp)
                                console.log("otp:", otp)
                                res.cookie('email', email, { httpOnly: true, maxAge: FIVE_MINUTE})
                                res.status(200).json({ success: true, message: "We sended OTP to your email , please verify" })
                            }).catch((e3) => {
                                res.status(500).json({ success: false, message: e3+" Something went Wrong , OTP not sended" })
                            })
                        } else {
                            if (userInTempUsers === "email") {
                                res.status(401).json({ success: false, message: "Email Already Exist" })
                            } else if (userInTempUsers === "username") {
                                res.status(401).json({ success: false, message: "username Already Exist" })
                            } else {
                                res.status(500).json({ success: false, message: "Something went Wrong , please try again later " })
                            }

                        }
                    })

                } else {
                    res.status(401).json({ success: false, message: "username Already Exist" })
                }
            }).catch((e1) => {
                res.status(500).json({ success: false, message: e1.message + ", Retry later or Report " })
            })
        } else {
            res.status(401).json({ success: false, message: "Email Already Exist" })
        }
    }).catch((e0) => {
        res.status(500).json({ success: false, message: e0.message + ", Retry later or Report " })
    })

}

const checkUserInTempUser = (email, username) => {
    return new Promise((resolve,reject) => {
        

    /* This function return false when user is available
    return "username" whene username not available
    return "email" whene email not available */

    removeJunkTempUsers()

    let ret = false

    const findUserInTempUsersWithEmailQuery = `SELECT * FROM temporary_users WHERE email="${email}";`
    const findUserInTempUsersWithusernameQuery = `SELECT * FROM temporary_users WHERE user_name="${username}";`

    sql(findUserInTempUsersWithEmailQuery).then((row0) => {
        if (row0.length < 1) {
            sql(findUserInTempUsersWithusernameQuery).then((row1) => {
                if (row1.length < 1) {
                    ret = false
                    resolve(ret)
                } else {
                    if ((Date.now() - row1[4]) > 200) {
                        const deleteUserQuery = `DELETE FROM temporary_users WHERE user_name="${username}";`
                        sql(deleteUserQuery).then(() => {
                            ret = false
                        }).catch(() => {
                            ret = "username"
                            resolve(ret)
                        })
                    } else {
                        ret = "username"
                        resolve(ret)
                    }
                }
            }).catch(() => {
                ret = "username"
                resolve(ret)
            })
        } else {
            if ((Date.now() - row0[4]) > 60 * 5) {
                const deleteUserQuery = `DELETE FROM temporary_users WHERE email="${email}";`
                sql(deleteUserQuery).then(() => {
                    sql(findUserInTempUsersWithusernameQuery).then((row1) => {
                        if (row1.length < 1) {
                            ret = false
                        } else {
                            if ((Date.now() - row1[4]) > 60 * 5) {
                                const deleteUserQuery = `DELETE FROM temporary_users WHERE user_name="${username}";`
                                sql(deleteUserQuery).then(() => {
                                    ret = false
                                    resolve(ret)
                                }).catch(() => {
                                    ret = "username"
                                    resolve(ret)
                                })
                            } else {
                                ret = "username"
                                resolve(ret)
                            }
                        }
                    }).catch(() => {
                        ret = "username"
                        resolve(ret)
                    })
                }).catch(() => {
                    ret = "email"
                    resolve(ret)
                })
            } else {
                ret = "email"
                resolve(ret)
            }
        }
    }).catch(() => {
        ret = "email"
        resolve(ret)
    })
        resolve(ret)
    })
}

const sendOtp = (email, otp) => {
        try {
            emailChannel.sendToQueue(queue, Buffer.from(JSON.stringify({ type: "verifyEmailOtp", email, otp })));
        } catch (e) {
            reject(e)
        }
}

export default register
