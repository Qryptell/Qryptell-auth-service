import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import sql from '../configurations/mysql.js'
import { nanoid } from 'nanoid'
import createSession from '../controllers/createSession.js'

const login = async (req, res) => {

    const { email, password } = req.body
    const { sessionId, refreshToken } = req.cookies
    
    console.log('cookies : ', req.cookies);

    const getUserQuery = `SELECT * FROM users WHERE email="${email}"`

    if (!(email && password)) {
        return res.status(401).json({ success: false, message: "Missing Crendential" })
    }

    const [user] = await sql(getUserQuery)

    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password" })
    }
    if (!(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: "Invalid email or password" })
    }

    const accessToken = jwt.sign({ email, userId: user._id, username: user.user_name }, process.env.JWT_ACCESS_SECRET, { expiresIn: '10h', issuer: 'lunarloom_auth:service' })
    const [session] = await sql(`select * from auth where session_id="${sessionId}"`)
    if (sessionId && session) {
        console.log("session.refreshToken " + session.refresh_token);
        console.log("refreshToken " + refreshToken);
        await sql(`delete from auth where session_id="${sessionId}"`)
    }
    const newRefreshToken = nanoid()
    const newSessionId = nanoid()
    createSession(user._id,newRefreshToken , newSessionId).then(() => {
        res.cookie('refreshToken', newRefreshToken, { maxAge: 30 * 24 * 60 * 60, httpOnly: true })
        res.cookie('sessionId', newSessionId, { maxAge: 30 * 24 * 60 * 60, httpOnly: true })
        res.status(200).json({ success: true, accessToken, refreshToken:newRefreshToken })
    }).catch(() => {
        res.status(500).json({ success: false, message: "Something went Wrong , please try again later" })
    })
}

export default login