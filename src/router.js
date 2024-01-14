import express from 'express'
import login from './auth/login.js'
import register from './auth/register.js'
import verifyEmail from './auth/verifyEmail.js'
import refreshToken from './auth/refreshToken.js'
import logout from './auth/logout.js'
import changePassword from './auth/changePassword.js'

const router = new express.Router()

router.post('/auth/register',register)
router.post('/auth/verify-email',verifyEmail)
router.post('/auth/login',login)
router.post('/auth/refresh-token',refreshToken)
router.post('/auth/forgot-password')
router.post('/auth/change-password',changePassword)
router.post('/auth/logout',logout)

export default router
