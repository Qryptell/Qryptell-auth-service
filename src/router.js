import express from 'express'
import login from './auth/login.js'
import register from './auth/register.js'
import verifyEmail from './auth/verifyEmail.js'
import refreshToken from './auth/refreshToken.js'
import logout from './auth/logout.js'
import changePassword from './auth/changePassword.js'

const router = new express.Router()

router.post('/register',register)
router.post('/verify-email',verifyEmail)
router.post('/login',login)
router.post('/refresh-token',refreshToken)
router.post('/forgot-password')
router.post('/change-password',changePassword)
router.post('/logout',logout)

export default router
