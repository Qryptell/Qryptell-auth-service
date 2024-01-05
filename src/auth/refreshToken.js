import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import sql from '../configurations/mysql.js'

export default function refreshAccessToken(req, res) {
    console.log(req.cookies);
    const { refreshToken, sessionId } = req.cookies

    const getRefreshTokenQuery = `SELECT * FROM auth WHERE session_id="${sessionId}"`
    const deleteUserWithSessionIdQuery = `DELETE FROM auth WHERE session_id="${sessionId}"`
    const deleteUserWithRefTokenQuery = `DELETE FROM auth WHERE session_id="${sessionId}"`

    if (!refreshToken) res.status(400).json({ success: false, message: "Missing refresh token" })

    sql(getRefreshTokenQuery).then(async ([{refresh_token,user_id}]) => {
        const [user] = await sql(`select * from users where _id="${user_id}"`)
        if (refresh_token === refreshToken) {
            const accessToken = jwt.sign({ email:user.email, user_id, userName: user.username}, process.env.JWT_ACCESS_SECRET, { expiresIn: '10h', issuer: 'lunarloom_auth:service' })
            const refreshToken = nanoid()
            createSession(user_id, refreshToken, sessionId).then(() => {
                res.cookie('refeshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60, httpOnly: true })
                res.cookie('sessionIdd', sessionId, { maxAge: 30 * 24 * 60 * 60, httpOnly: true })
                res.status(200).json({ success: true, accessToken, refreshToken })
            }).catch(() => {
                res.status(500).json({ success: false, message: "Something went Wrong , please try again later" })
            })
        } else {
            await sql(deleteUserWithRefTokenQuery)
            await sql(deleteUserWithSessionIdQuery)
            res.status(401).json({ success: false, message: "Authuntication Failed" })
        }
    })

}