import deleteSession from "../controllers/deleteSession.js"

export default function logout(req, res) {
    const { sessionId } = req.cookies
    deleteSession(sessionId).then(() => {
        res.cookie('refreshToken', null,{ maxAge: 0, httpOnly: true })
        res.cookie('sessionId', sessionId, { maxAge: 0, httpOnly: true })
        res.status(200).json({ success: true, message: "logout success" })
    }).catch(() => {
        res.status(400).json({ success: false, message: "Something wrong please try again later" })
    })
}