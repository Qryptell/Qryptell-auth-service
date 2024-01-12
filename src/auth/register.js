import bcrypt from 'bcrypt'
import sql from '../configurations/mysql.js'
import { emailChannel, queue } from '../configurations/rabbitmq.js'
import removeJunkTempUsers from '../controllers/removeJunkTempUsers.js'


const register = async (req, res) => {

    console.log("req is here");

    const { email, password, username } = req.body
    console.log(email, password, username)

    if (!(email && password && username)) {
        return res.status(401).json({ success: false, message: "Missing Crendential" })
    }

    // password encrypting with bcrypt
    const encrypedPassword = await bcrypt.hash(password, 12)
    const otp = Math.floor(Math.random() * (999999 - 100000) + 100000)
    console.log(otp)
    const encrypedOtp = await bcrypt.hash(`${otp}`, 12)

    //declaring all needed sql queries

    const storeTemporaryUsersQuery = `INSERT INTO temporary_users VALUES("${email}","${encrypedOtp}","${username}","${encrypedPassword}","${Date.now()}");`
    const findUserWithEmailQuery = `SELECT * FROM users WHERE email="${email}";`
    const findUserWithusernameQuery = `SELECT * FROM users WHERE username="${username}";`

    //check availability of email
    sql(findUserWithEmailQuery).then((row0) => {
        if (row0.length < 1) {
            //check availabilty of username
            sql(findUserWithusernameQuery).then((row1) => {
                if (row1.length < 1) {
                    const userInTempUsers = checkUserInTempUser()
                    if (!userInTempUsers) {
                        sql(storeTemporaryUsersQuery).then(() => {
                            sendOtp(email, otp).then(() => {
                                console.log("otp:", otp)
                                res.cookie('email', email, { httpOnly: true, maxAge: 1000000 })
                                res.status(200).json({ success: true, message: "We sended OTP to your email , please verify" })
                            }).catch((e2) => {
                                res.status(500).json({ success: false, message: e2.message + ", Retry later or Report " })
                            })
                        }).catch(() => {
                            res.status(500).json({ success: false, message: " Something went Wrong , OTP not sended" })
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

    /* This function return false when user is available
    return "username" whene username not available
    return "email" whene email not available */

    removeJunkTempUsers()

    let ret = false

    const findUserInTempUsersWithEmailQuery = `SELECT * FROM temporary_users WHERE email="${email}";`
    const findUserInTempUsersWithusernameQuery = `SELECT * FROM temporary_users WHERE username="${username}";`

    sql(findUserInTempUsersWithEmailQuery).then((row0) => {
        if (row0.length < 1) {
            sql(findUserInTempUsersWithusernameQuery).then((row1) => {
                if (row1.length < 1) {
                    ret = false
                } else {
                    if ((Date.now() - row1[4]) > 200) {
                        const deleteUserQuery = `DELETE FROM temporary_users WHERE user_name="${username}";`
                        sql(deleteUserQuery).then(() => {
                            ret = false
                        }).catch(() => {
                            ret = "username"
                        })
                    } else {
                        ret = "username"
                    }
                }
            }).catch(() => {
                ret = "username"
            })
        } else {
            if ((Date.now() - row0[4]) > 200) {
                const deleteUserQuery = `DELETE FROM temporary_users WHERE email="${email}";`
                sql(deleteUserQuery).then(() => {
                    sql(findUserInTempUsersWithusernameQuery).then((row1) => {
                        if (row1.length < 1) {
                            ret = false
                        } else {
                            if ((Date.now() - row1[4]) > 180) {
                                const deleteUserQuery = `DELETE FROM temporary_users WHERE user_name="${username}";`
                                sql(deleteUserQuery).then(() => {
                                    ret = false
                                }).catch(() => {
                                    ret = "username"
                                })
                            } else {
                                ret = "username"
                            }
                        }
                    }).catch(() => {
                        ret = "username"
                    })
                }).catch(() => {
                    ret = "email"
                })
            } else {
                ret = "email"
            }
        }
    }).catch(() => {
        ret = "email"
    })

    return ret

}

const sendOtp = (email, otp) => {
    return new Promise(async (resolve, reject) => {
        try {
            await emailChannel.sendToQueue(queue, Buffer.from(JSON.stringify({ type: "verifyEmailOtp", email, otp })));
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

export default register