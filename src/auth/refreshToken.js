import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import sql from '../configurations/mysql.js'
import updateSession from '../controllers/updateSession.js';

export default function refreshAccessToken(req, res) {

    const { refreshToken, sessionId } = req.cookies

    const getRefreshTokenQuery = `SELECT * FROM auth WHERE session_id="${sessionId}"`
    const deleteUserWithSessionIdQuery = `DELETE FROM auth WHERE session_id="${sessionId}"`

    if (!refreshToken) return res.status(401).json({ success: false, message: "Missing refresh token" })

    sql(getRefreshTokenQuery).then(async (list) => {
        if (list.length == 0) {
            return res.status(401).json({ success: false, message: "Authuntication Failed" })
        }
        var { refresh_token, user_id } = list[0]
        const [user] = await sql(`select * from users where _id="${user_id}"`)
        if (refresh_token === refreshToken) {
            const accessToken = jwt.sign({ email: user.email, userId: user_id, username: user.username }, process.env.JWT_ACCESS_SECRET, { expiresIn: '10h', issuer: 'lunarloom_auth:service' })
            const refreshToken = nanoid()
            updateSession(refreshToken, sessionId).then(() => {
                res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60, httpOnly: true })
                res.cookie('sessionId', sessionId, { maxAge: 30 * 24 * 60 * 60, httpOnly: true })
                res.status(200).json({ success: true, accessToken })
            }).catch(() => {
                res.status(500).json({ success: false, message: "Something went Wrong , please try again later" })
            })
        } else {
            await sql(deleteUserWithSessionIdQuery)
            res.status(401).json({ success: false, message: "Authuntication Failed" })
        }
    })

}
