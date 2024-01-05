import bcrypt from 'bcrypt'
import sql from '../configurations/mysql.js'
import { emailChannel, queue } from '../configurations/rabbitmq.js'
import removeJunkTempUsers from '../controllers/removeJunkTempUsers.js'


const register = async (req, res) => {

    const { email, password, userName } = req.body
    console.log(email, password, userName );

    if (!(email && password && userName)) {
        return res.status(401).json({ success: false, message: "Missing Crendential" })
    }

    // password encrypting with bcrypt
    const encrypedPassword = await bcrypt.hash(password, 12)
    const otp = Math.floor(Math.random() * (999999 - 100000) + 100000)
    console.log(otp);
    const encrypedOtp = await bcrypt.hash(`${otp}`, 12)

    //dclaring all needed sql queries

    const storeTemporaryUsersQuery = `INSERT INTO temporary_users VALUES("${email}","${encrypedOtp}","${userName}","${encrypedPassword}","${Date.now()}");`
    const findUserWithEmailQuery = `SELECT * FROM users WHERE email="${email}";`
    const findUserWithUserNameQuery = `SELECT * FROM users WHERE username="${userName}";`


    //check all credentiels present
    //check availability of email
    sql(findUserWithEmailQuery).then((row0) => {
        if (row0.length < 1) {
            //check availabilty of username
            sql(findUserWithUserNameQuery).then((row1) => {
                if (row1.length < 1) {
                    const userInTempUsers = checkUserInTempUser()
                    if (!userInTempUsers) {
                        sql(storeTemporaryUsersQuery).then(() => {
                            sendOtp(email, otp).then(() => {
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
                            res.status(401).json({ success: false, message: "Username Already Exist" })
                        } else {
                            res.status(500).json({ success: false, message: "Something went Wrong , please try again later " })
                        }

                    }

                } else {
                    res.status(401).json({ success: false, message: "Username Already Exist" })
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

const checkUserInTempUser = (email, userName) => {

    /* This function return false when user is available
    return "username" whene username not available
    return "email" whene email not available */

    removeJunkTempUsers()

    let ret = false

    const findUserInTempUsersWithEmailQuery = `SELECT * FROM temporary_users WHERE email="${email}";`
    const findUserInTempUsersWithUserNameQuery = `SELECT * FROM temporary_users WHERE username="${userName}";`

    sql(findUserInTempUsersWithEmailQuery).then((row0) => {
        if (row0.length < 1) {
            sql(findUserInTempUsersWithUserNameQuery).then((row1) => {
                if (row1.length < 1) {
                    ret = false
                } else {
                    if ((Date.now() - row1[4]) > 200) {
                        const deleteUserQuery = `DELETE FROM temporary_users WHERE user_name="${userName}";`
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
                    sql(findUserInTempUsersWithUserNameQuery).then((row1) => {
                        if (row1.length < 1) {
                            ret = false
                        } else {
                            if ((Date.now() - row1[4]) > 180) {
                                const deleteUserQuery = `DELETE FROM temporary_users WHERE user_name="${userName}";`
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