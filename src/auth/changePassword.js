import bcrypt from 'bcrypt'
import sql from '../configurations/mysql.js'

export default function changePassword(req, res) {

    const { sessionId, refreshToken } = req.cookies
    console.log(req.cookies);
    const { email, password } = req.body

    if (!(email && password)) {
        return res.status(419).json({ success: false, message: "Password or Email Missing" })
    }

    const checkSessionExistQuery = `SELECT * FROM auth WHERE session_id="${sessionId}"`
    const updatePasswordQuery = `UPDATE users SET password="${bcrypt.hash(password, 12)}" WHERE email="${email}"`

    sql(checkSessionExistQuery).then((refresh_token) => {
        if (refreshToken === refresh_token) {
            sql(updatePasswordQuery).then(() => {
                return res.status(200).json({ success: true, message: "Password Changed" })
            }).catch(() => {
                return res.status(401).json({ success: false, message: "Something went Wrong , Please Login Again and Try Again" })
            })
        } else {
            return res.status(401).json({ success: false, message: "Something went Wrong , Please Login Again and Try Again" })
        }
    }).catch(() => {
        return res.status(401).json({ success: false, message: "Login to Change Password" })
    })
}