import bcrypt from 'bcrypt'
import sql from '../configurations/mysql.js'
import { nanoid } from 'nanoid'
import createSession from '../controllers/createSession.js'
import jwt from 'jsonwebtoken'
import createUser from '../controllers/createUser.js'

export default function verifyEmail(req, res) {
    const { otp } = req.body
    // const { email } = req.cookies
    const {email} = req.cookies
    console.log(req.cookies);

    const getTempUserQuery = `SELECT * FROM temporary_users WHERE email="${email}";`
    const deleteTempUserQuery = `DELETE FROM temporary_users WHERE email="${email}";`

    if (!email) return res.json({ success: false, message: "Requiest Timed out" })

    sql(getTempUserQuery).then(async ([user]) => {
        console.log(user.otp)
        if (email == user.email) {
            if (await bcrypt.compare(`${otp}`, user.otp)) {
                const userId = nanoid()
                const sessionId = nanoid()
                createUser(userId, email, user.user_name, user.password).then(async () => {
                    await sql(deleteTempUserQuery)
                    const accessToken = jwt.sign({ email, userId, username: user.user_name }, process.env.JWT_ACCESS_SECRET, { expiresIn: '10h', issuer: 'lunarloom_auth:service' })
                    const refreshToken = nanoid()
                    createSession(userId, refreshToken, sessionId).then(() => {
                        res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60, httpOnly: true })
                        res.cookie('sessionId', sessionId, { maxAge: 30 * 24 * 60 * 60, httpOnly: true })
                        res.status(200).json({ success: true, accessToken })
                    }).catch(() => {
                        res.status(500).json({ success: false, message: "Something went Wrong , please try again later" })
                    })
                })
            } else {
                return res.status(401).json({ success: false, message: "Invalid OTP" })
            }
        } else {
            return res.status(401).json({ success: false, message: "Invalid email" })
        }
    }).catch((e1) => {
        return res.status(500).json({ success: false, message: "OTP expired , please try again" })
    })


}

